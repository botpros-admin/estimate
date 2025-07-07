// Email Service for Paint Estimator
(function() {
  'use strict';
  
  const EmailService = {
    // Email template configurations
    templates: {
      estimate: {
        subject: 'Your Paint Estimate from {{companyName}}',
        body: `Dear {{customerName}},

Thank you for considering {{companyName}} for your painting project. Please find your detailed estimate below.

PROJECT DETAILS:
{{projectDetails}}

ESTIMATE SUMMARY:
{{estimateSummary}}

Total Estimate: {{totalAmount}}

This estimate is valid for 30 days from the date of issue. Please feel free to contact us if you have any questions or would like to proceed with the project.

Best regards,
{{companyName}}
{{companyPhone}}
{{companyEmail}}`
      },
      
      contract: {
        subject: 'Paint Service Contract - {{projectAddress}}',
        body: `Dear {{customerName}},

Please find attached your paint service contract for the project at {{projectAddress}}.

CONTRACT HIGHLIGHTS:
- Total Contract Amount: {{totalAmount}}
- Project Start Date: {{startDate}}
- Estimated Completion: {{completionDate}}
- Payment Terms: {{paymentTerms}}

NEXT STEPS:
1. Review the attached contract carefully
2. Sign and return one copy
3. Submit the initial deposit as outlined in the payment terms

We look forward to working with you on this project. Please don't hesitate to reach out if you have any questions.
Best regards,
{{companyName}}
{{companyPhone}}
{{companyEmail}}`
      },
      
      followUp: {
        subject: 'Following Up on Your Paint Estimate',
        body: `Dear {{customerName}},

I wanted to follow up on the paint estimate we provided for your project at {{projectAddress}}.

The estimate was sent on {{estimateDate}} and includes:
{{scopeSummary}}

We're still available to start your project and would be happy to answer any questions you might have about the estimate or our services.

Would you like to schedule a time to discuss the project further?

Best regards,
{{companyName}}
{{companyPhone}}
{{companyEmail}}`
      }
    },    
    // Generate email data from form state
    generateEmailData: function(type = 'estimate') {
      const state = formState.data;
      const template = this.templates[type];
      
      if (!template) {
        if (window.ErrorHandler) {
          window.ErrorHandler.error('Invalid email template type', {
            category: window.ErrorCategory.VALIDATION,
            context: { type }
          });
        }
        return null;
      }
      
      // Extract company info (could be from settings or hardcoded)
      const companyInfo = {
        companyName: state.companyName || 'Professional Painting Services',
        companyPhone: state.companyPhone || '(555) 123-4567',
        companyEmail: state.companyEmail || 'info@paintingservices.com'
      };
      
      // Extract customer info
      const customerInfo = {
        customerName: state.customerName || 'Valued Customer',
        customerEmail: state.customerEmail || '',
        customerPhone: state.customerPhone || ''
      };
      
      // Extract project info
      const projectInfo = {
        projectAddress: state.address || 'Project Location',
        projectDetails: this.formatProjectDetails(state),
        estimateSummary: this.formatEstimateSummary(state),
        scopeSummary: this.formatScopeSummary(state),
        totalAmount: this.formatCurrency(state.grandTotal || 0),
        estimateDate: new Date().toLocaleDateString(),
        startDate: state.startDate || 'To be determined',
        completionDate: state.completionDate || 'To be determined',
        paymentTerms: state.paymentTerms || 'As outlined in contract'
      };
      
      // Merge all data
      const emailData = {
        ...companyInfo,
        ...customerInfo,
        ...projectInfo
      };
      
      // Process template
      let subject = template.subject;
      let body = template.body;      
      // Replace placeholders
      Object.keys(emailData).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = emailData[key] || '';
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      });
      
      return {
        to: customerInfo.customerEmail,
        subject: subject,
        body: body,
        data: emailData
      };
    },
    
    // Format project details for email
    formatProjectDetails: function(state) {
      const details = [];
      
      if (state.projectType) {
        details.push(`Project Type: ${state.projectType}`);
      }
      
      if (state.projectScope) {
        const scope = [];
        if (state.projectScope.interior) scope.push('Interior');
        if (state.projectScope.exterior) scope.push('Exterior');
        details.push(`Scope: ${scope.join(' & ')}`);
      }
      
      if (state.surfaces && state.surfaces.length > 0) {
        details.push(`Surfaces: ${state.surfaces.map(s => s.name).join(', ')}`);
      }
      
      if (state.totalSurfaceArea) {
        details.push(`Total Surface Area: ${this.formatNumber(state.totalSurfaceArea)} sq ft`);
      }
      
      return details.join('\n');
    },    
    // Format estimate summary
    formatEstimateSummary: function(state) {
      const summary = [];
      
      if (state.materialsCost) {
        summary.push(`Materials: ${this.formatCurrency(state.materialsCost)}`);
      }
      
      if (state.laborCost) {
        summary.push(`Labor: ${this.formatCurrency(state.laborCost)}`);
      }
      
      if (state.overhead) {
        summary.push(`Overhead: ${this.formatCurrency(state.overhead)}`);
      }
      
      if (state.profit) {
        summary.push(`Profit: ${this.formatCurrency(state.profit)}`);
      }
      
      if (state.tax) {
        summary.push(`Tax: ${this.formatCurrency(state.tax)}`);
      }
      
      return summary.join('\n');
    },
    
    // Format scope summary
    formatScopeSummary: function(state) {
      const scope = [];
      
      if (state.paintSelections && state.paintSelections.length > 0) {
        state.paintSelections.forEach(selection => {
          if (selection.brand && selection.productName) {
            scope.push(`- ${selection.type} Paint: ${selection.brand} ${selection.productName}`);
          }
        });
      }
      
      if (state.serviceTypes && state.serviceTypes.length > 0) {
        scope.push(`- Services: ${state.serviceTypes.join(', ')}`);
      }
      
      return scope.join('\n');
    },    
    // Send email using mailto (client-side)
    sendViaMailto: function(emailData) {
      if (!emailData) return false;
      
      const { to, subject, body } = emailData;
      
      // Construct mailto link
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open in default email client
      window.location.href = mailtoLink;
      
      return true;
    },
    
    // Send email with attachment (requires backend)
    sendWithAttachment: function(emailData, attachmentBlob, attachmentName) {
      // This would require backend implementation
      if (window.ErrorHandler) {
        window.ErrorHandler.info('Email with attachment requires backend implementation', {
          context: { 
            emailData, 
            attachmentName,
            note: 'Backend service not yet implemented'
          }
        });
      }
      
      // Show instructions for backend integration
      this.showBackendInstructions(emailData, attachmentBlob, attachmentName);
    },
    
    // Utility functions
    formatCurrency: function(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    },
    
    formatNumber: function(num) {
      return new Intl.NumberFormat('en-US').format(num || 0);
    },    
    // Show backend integration instructions
    showBackendInstructions: function(emailData, attachmentBlob, attachmentName) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
      modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Email Service Integration Required</h3>
            
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-600 mb-4">
                To send emails with PDF attachments, you'll need to integrate with an email service. 
                Here are the recommended options:
              </p>
              
              <div class="space-y-4">
                <div class="border rounded p-3">
                  <h4 class="font-semibold">Option 1: SendGrid API</h4>
                  <pre class="bg-gray-100 p-2 mt-2 text-xs overflow-x-auto">
// Backend endpoint example (Node.js)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, attachment } = req.body;
  
  const msg = {
    to: to,
    from: 'your@email.com',
    subject: subject,
    text: body,
    attachments: [{
      content: attachment.content,
      filename: attachment.filename,
      type: 'application/pdf'
    }]
  };
  
  await sgMail.send(msg);
  res.json({ success: true });
});</pre>
                </div>
                
                <div class="border rounded p-3">
                  <h4 class="font-semibold">Option 2: Email Service Integration</h4>
                  <p class="text-sm">Integrate with your existing email service (Gmail, Outlook, etc.) using their APIs.</p>                </div>
                
                <div class="border rounded p-3">
                  <h4 class="font-semibold">Option 3: Download and Manual Send</h4>
                  <p class="text-sm">For now, you can download the PDF and attach it manually to your email.</p>
                  <button onclick="EmailService.downloadAndPrepareEmail('${attachmentName}')" 
                          class="mt-2 btn btn-primary">
                    Download PDF & Open Email
                  </button>
                </div>
              </div>
            </div>
            
            <div class="items-center px-4 py-3">
              <button onclick="this.closest('.fixed').remove()" 
                      class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600">
                Close
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    },
    
    // Download PDF and prepare email
    downloadAndPrepareEmail: function(filename) {
      // Close modal if open
      const modal = document.querySelector('.fixed.inset-0');
      if (modal) modal.remove();
      
      // Trigger PDF download (assuming PDF is already generated)
      const downloadBtn = document.querySelector('.btn-download-pdf');
      if (downloadBtn) downloadBtn.click();
      
      // Open email client after short delay
      setTimeout(() => {
        const emailData = this.generateEmailData();
        this.sendViaMailto(emailData);
      }, 500);
    },    
    // Initialize email buttons on pages
    initializeEmailButtons: function() {
      // Add email button next to PDF export buttons
      const estimatePage = document.querySelector('#estimate-display');
      const contractPage = document.querySelector('#contract-display');
      
      if (estimatePage) {
        this.addEmailButton('estimate', estimatePage);
      }
      
      if (contractPage) {
        this.addEmailButton('contract', contractPage);
      }
    },
    
    // Add email button to page
    addEmailButton: function(type, container) {
      const actionsDiv = container.querySelector('.estimate-actions') || 
                        container.querySelector('.contract-actions');
      
      if (!actionsDiv) return;
      
      // Check if email button already exists
      if (actionsDiv.querySelector('.btn-email')) return;
      
      const emailBtn = document.createElement('button');
      emailBtn.className = 'btn btn-secondary btn-email';
      emailBtn.innerHTML = '<i class="fas fa-envelope"></i> Send via Email';
      emailBtn.onclick = () => this.handleEmailClick(type);
      
      actionsDiv.appendChild(emailBtn);
    },
    
    // Handle email button click
    handleEmailClick: function(type) {
      const emailData = this.generateEmailData(type);
      
      if (!emailData.to || emailData.to === '') {
        alert('Please enter customer email address in the form.');
        return;
      }
      
      // Check if PDF exists
      const pdfGenerated = document.querySelector('.btn-download-pdf');      
      if (pdfGenerated) {
        // Show options for sending with attachment
        this.showEmailOptions(emailData, type);
      } else {
        // Send without attachment
        this.sendViaMailto(emailData);
      }
    },
    
    // Show email sending options
    showEmailOptions: function(emailData, type) {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
      modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Send ${type === 'estimate' ? 'Estimate' : 'Contract'}</h3>
          
          <div class="space-y-3">
            <button onclick="EmailService.sendViaMailto(${JSON.stringify(emailData).replace(/"/g, '&quot;')}); this.closest('.fixed').remove();" 
                    class="w-full btn btn-primary">
              <i class="fas fa-envelope"></i> Open in Email Client
            </button>
            
            <button onclick="EmailService.downloadAndPrepareEmail('${type}.pdf'); this.closest('.fixed').remove();" 
                    class="w-full btn btn-secondary">
              <i class="fas fa-download"></i> Download PDF & Email
            </button>
            
            <button onclick="this.closest('.fixed').remove()" 
                    class="w-full btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
  };
  
  // Export to global scope
  window.EmailService = EmailService;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EmailService.initializeEmailButtons());
  } else {
    EmailService.initializeEmailButtons();
  }
})();