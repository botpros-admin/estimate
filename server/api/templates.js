/**
 * Template API Endpoints
 * REST API for template operations
 */

const fs = require('fs').promises;
const path = require('path');

// Template data directory
const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'js', 'templates');
const TEMPLATE_CACHE_FILE = path.join(__dirname, '..', 'templateCache.json');

/**
 * Load all available templates
 */
async function loadTemplates() {
  try {
    // In production, this would load from a database
    // For now, we'll create a JSON representation of templates
    const templateData = require(path.join(TEMPLATES_DIR, 'allTemplates.js'));
    return templateData.CONTRACT_TEMPLATES || {};
  } catch (error) {
    console.error('Error loading templates:', error);
    return {};
  }
}

/**
 * Load template usage statistics
 */
async function loadTemplateStats() {
  try {
    const data = await fs.readFile(TEMPLATE_CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default stats if file doesn't exist
    return {
      usage: {},
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Save template usage statistics
 */
async function saveTemplateStats(stats) {
  await fs.writeFile(TEMPLATE_CACHE_FILE, JSON.stringify(stats, null, 2));
}

/**
 * Parse JSON body from request
 */
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Handle template API requests
 */
async function handleTemplateApiRequest(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // GET /api/templates - List all templates
    if (pathname === '/api/templates' && req.method === 'GET') {
      const templates = await loadTemplates();
      const templateList = Object.keys(templates).map(key => ({
        key,
        title: templates[key].doc_info.doc_title,
        isWorkOrder: templates[key].work_order || false,
        hasDeposit: templates[key].dynamic_overrides?.deposit_pct > 0,
        version: templates[key].doc_info.internal_version || '1.0'
      }));
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        templates: templateList,
        count: templateList.length
      }));
      return;
    }

    // GET /api/templates/:id - Get specific template
    const templateMatch = pathname.match(/^\/api\/templates\/([A-Z_]+)$/);
    if (templateMatch && req.method === 'GET') {
      const templateKey = templateMatch[1];
      const templates = await loadTemplates();
      const template = templates[templateKey];
      
      if (!template) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Template not found'
        }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        template: {
          ...template,
          key: templateKey
        }
      }));
      return;
    }

    // POST /api/templates/suggest - Get template suggestions
    if (pathname === '/api/templates/suggest' && req.method === 'POST') {
      const data = await parseBody(req);
      const { projectType, serviceTypes, surfaces, contractPrice } = data;
      
      // Import suggestion logic
      const { suggestTemplate } = require('../../js/modules/templateSuggestion');
      
      const suggestion = suggestTemplate({
        projectType,
        serviceTypes,
        surfaces,
        contractPrice
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        suggestion
      }));
      return;
    }

    // POST /api/templates/validate - Validate data against template
    if (pathname === '/api/templates/validate' && req.method === 'POST') {
      const data = await parseBody(req);
      const { templateKey, formData } = data;
      
      // Import validation logic
      const { validateTemplate } = require('../../js/modules/templateValidator');
      
      const validation = validateTemplate(formData, templateKey);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        validation
      }));
      return;
    }

    // POST /api/templates/calculate-deposit - Calculate deposit for template
    if (pathname === '/api/templates/calculate-deposit' && req.method === 'POST') {
      const data = await parseBody(req);
      const { templateKey, contractPrice } = data;
      
      // Import deposit calculator
      const { calculateDeposit } = require('../../js/modules/depositCalculator');
      
      const deposit = calculateDeposit(contractPrice, templateKey);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        deposit
      }));
      return;
    }

    // POST /api/templates/check-work-order - Check if work order is appropriate
    if (pathname === '/api/templates/check-work-order' && req.method === 'POST') {
      const data = await parseBody(req);
      
      // Import work order logic
      const { calculateWorkOrderScore } = require('../../js/modules/workOrderLogic');
      
      const evaluation = calculateWorkOrderScore(data);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        evaluation
      }));
      return;
    }

    // POST /api/templates/usage - Track template usage
    if (pathname === '/api/templates/usage' && req.method === 'POST') {
      const data = await parseBody(req);
      const { templateKey, action } = data;
      
      const stats = await loadTemplateStats();
      
      if (!stats.usage[templateKey]) {
        stats.usage[templateKey] = {
          selected: 0,
          previewed: 0,
          generated: 0,
          lastUsed: null
        };
      }
      
      switch (action) {
        case 'preview':
          stats.usage[templateKey].previewed++;
          break;
        case 'select':
          stats.usage[templateKey].selected++;
          break;
        case 'generate':
          stats.usage[templateKey].generated++;
          break;
      }
      
      stats.usage[templateKey].lastUsed = new Date().toISOString();
      stats.lastUpdated = new Date().toISOString();
      
      await saveTemplateStats(stats);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        usage: stats.usage[templateKey]
      }));
      return;
    }

    // GET /api/templates/stats - Get template usage statistics
    if (pathname === '/api/templates/stats' && req.method === 'GET') {
      const stats = await loadTemplateStats();
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        stats
      }));
      return;
    }

    // GET /api/templates/fields/:templateKey - Get required fields for template
    if (pathname.match(/^\/api\/templates\/fields\/([A-Z_]+)$/) && req.method === 'GET') {
      const templateKey = pathname.match(/^\/api\/templates\/fields\/([A-Z_]+)$/)[1];
      const templates = await loadTemplates();
      const template = templates[templateKey];
      
      if (!template) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Template not found'
        }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        fields: {
          required: template.required_fields || {},
          optional: template.optional_fields || {},
          conditional: template.conditional_fields || {}
        }
      }));
      return;
    }

    // If no endpoint matched, return 404
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: 'Template API endpoint not found'
    }));

  } catch (error) {
    console.error('Template API error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message
    }));
  }
}

module.exports = {
  handleTemplateApiRequest,
  loadTemplates,
  loadTemplateStats,
  saveTemplateStats
};