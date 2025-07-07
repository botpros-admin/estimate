// Hartzell Contract Generator Service
// Generates contracts matching the official Hartzell Painting format

function generateHartzellContract(formData) {
  // Helper function for safe data access
  const get = (obj, path, defaultValue = '') => {
    const keys = path.split('.');
    let result = obj;
    for (let key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    return result === null || result === undefined ? defaultValue : result;
  };

  // Get contract details from the enhanced estimate page
  const contractDetails = get(formData, 'contractDetails', {});
  
  // Format date
  const today = new Date();
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Get client info
  const clientName = get(contractDetails, 'clientName', get(formData, 'contacts.0.name', ''));
  const clientPhone = get(formData, 'contacts.0.phone', '');
  const clientEmail = get(formData, 'contacts.0.email', '');
  const siteAddress = get(formData, 'siteAddress', {});
  
  // Build the contract HTML
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hartzell Painting Contract</title>
  <style>
    @page {
      size: letter;
      margin: 0.75in;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    /* Header Styles */
    .header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
    }
    
    .logo-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .logo {
      flex: 1;
      text-align: left;
    }
    
    .logo img {
      height: 80px;
      width: auto;
    }
    
    .contact-info {
      flex: 1;
      text-align: right;
      font-size: 10pt;
      line-height: 1.3;
    }
    
    .contact-info div {
      margin: 2px 0;
    }
    
    .company-name {
      font-size: 24pt;
      font-weight: bold;
      color: #003366;
      margin: 10px 0;
    }
    
    .tagline {
      font-size: 14pt;
      color: #0066cc;
      margin-bottom: 20px;
    }
    
    /* Document Title */
    .doc-title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin: 30px 0 20px 0;
      text-transform: uppercase;
    }
    
    /* Client Info Box */
    .client-info-box {
      border: 1px solid #333;
      padding: 10px;
      margin-bottom: 20px;
    }
    
    .client-info-box div {
      margin: 3px 0;
    }
    
    .client-info-box .label {
      font-weight: bold;
      display: inline-block;
      width: 100px;
    }
    
    /* Section Styles */
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .subsection-title {
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 5px;
    }
    
    /* Lists */
    ul {
      margin: 5px 0 10px 20px;
      padding-left: 10px;
    }
    
    li {
      margin-bottom: 3px;
    }
    
    /* Pricing Table */
    .pricing-section {
      margin: 20px 0;
    }
    
    .pricing-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px dotted #ccc;
    }
    
    .pricing-row.total {
      font-weight: bold;
      font-size: 12pt;
      border-bottom: 2px solid #000;
      border-top: 1px solid #000;
      margin-top: 10px;
      padding: 8px 0;
    }
    
    /* Terms Box */
    .terms-box {
      border: 1px solid #000;
      padding: 10px;
      margin: 20px 0;
      font-size: 10pt;
    }
    
    .terms-box .title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 5px;
    }
    
    /* Signature Section */
    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    
    .signature-block {
      display: inline-block;
      width: 45%;
      vertical-align: top;
    }
    
    .signature-block.left {
      margin-right: 8%;
    }
    
    .signature-line {
      border-bottom: 1px solid #000;
      margin: 30px 0 5px 0;
      height: 1px;
    }
    
    .signature-label {
      font-size: 10pt;
      margin-bottom: 5px;
    }
    
    /* Page Footer */
    .page-footer {
      position: fixed;
      bottom: 0.5in;
      left: 0.75in;
      right: 0.75in;
      text-align: center;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    
    /* Page Break */
    .page-break {
      page-break-after: always;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120pt;
      color: rgba(200, 200, 200, 0.1);
      font-weight: bold;
      z-index: -1;
      text-transform: uppercase;
    }
    
    /* Print Styles */
    @media print {
      body {
        margin: 0;
      }
      
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">HARTZELL</div>
  
  <!-- Header -->
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <div class="company-name">HARTZELL</div>
        <div class="tagline">PAINTING</div>
      </div>
      <div class="contact-info">
        <div><strong>O: 954-957-9761</strong></div>
        <div><strong>F: 954-957-9766</strong></div>
        <div>Hartzell Painting</div>
        <div>3195 N Powerline Rd Suite 101</div>
        <div>Pompano Beach, FL 33069</div>
      </div>
    </div>
  </div>
  
  <!-- Document Title -->
  <div class="doc-title">${get(contractDetails, 'documentType', 'proposal').toUpperCase()} FOR PROFESSIONAL PAINTING SERVICES</div>
  
  <!-- Date -->
  <div style="text-align: left; margin-bottom: 20px;">
    ${formatDate(today)}
  </div>
  
  <!-- Client Information Box -->
  <div class="client-info-box">
    <div><span class="label">Client Name:</span> ${clientName}</div>
    <div><span class="label">Street Address:</span> ${get(siteAddress, 'street', '')}</div>
    <div><span class="label">City, FL Zip:</span> ${get(siteAddress, 'city', '')}, FL ${get(siteAddress, 'zip', '')}</div>
    <div><span class="label">Phone:</span> ${clientPhone}</div>
    <div><span class="label">Email:</span> ${clientEmail}</div>
    <div><span class="label">ATTN:</span> ${clientName}</div>
  </div>
  
  <!-- Scope of Work Summary -->
  <div class="section">
    <div class="section-title">SCOPE OF WORK IN SUMMARY</div>
    <p>Pressure clean and repaint ${get(contractDetails, 'surfaces', []).length > 0 ? contractDetails.surfaces.map(s => s.name.toLowerCase()).join(', ') : 'surfaces'} to pre-approved color.</p>
  </div>
  
  <!-- Detailed Scope of Work -->
  <div class="section">
    <div class="section-title">SCOPE OF WORK IN SUMMARY:</div>`;

  // Add surface-specific scopes
  const surfaces = get(contractDetails, 'surfaces', get(formData, 'surfaces', []));
  let surfaceNum = 1;
  
  surfaces.forEach(surface => {
    if (parseFloat(surface.area) > 0) {
      html += `
    <div class="subsection-title">${surfaceNum}. ${surface.name}</div>
    <ul>`;
      
      // Add preparation steps if selected
      const prepSteps = get(contractDetails, 'preparationSteps', []);
      if (prepSteps.includes('pressure-wash')) {
        html += `<li>Pre-treat and Pressure clean ${surface.name.toLowerCase()} with up to 3000 PSI with HTH additive.</li>`;
      }
      
      html += `<li>Apply ${surface.coats || 'one'} coat${(surface.coats || '1') !== '1' ? 's' : ''} of ${get(contractDetails, 'materials.0.name', 'Acrylic Masonry Sealer')} to ${surface.name.toLowerCase()}.</li>`;
      
      if (prepSteps.includes('fill-patch')) {
        html += `<li>Fill in crack${surface.name.toLowerCase().includes('stucco') ? ' tiles with elastomeric fibrous patch.' : 's as needed.'}</li>`;
      }
      
      html += `<li>Paint ${surface.name.toLowerCase()} with ${surface.coats || '2'} Coat${(surface.coats || '2') !== '1' ? 's' : ''} of ${get(contractDetails, 'materials.1.name', 'Sherwin Williams Acrylic paint')}.</li>`;
      
      if (surface.specialInstructions) {
        html += `<li>${surface.specialInstructions}</li>`;
      }
      
      html += `</ul>`;
      surfaceNum++;
    }
  });

  html += `
  </div>
  
  <!-- Conditions -->
  <div class="section">
    <div class="section-title">CONDITIONS</div>
    <div class="subsection-title">General.</div>
    <p>Hartzell will supply all materials, tools, and equipment necessary for the Scope of Work. It is understood by all parties to this Proposal/Agreement that Hartzell, its agents, etc. are not employees of the Client. Hartzell complies with OSHA and the Construction Safety Act and is a drug free workplace.</p>
    
    <div class="subsection-title">Insurance & Licensing.</div>
    <p>Upon request, Hartzell will furnish suitable insurance certificates covering liability and property damage. Further upon request, for the additional sum of $250.00, the Client will be named as an additionally insured for those policies – Proof of Workman's Compensation coverage will be available. Policies shall be kept in force during the service period. Hartzell shall further provide valid and required licenses necessary to operate in the appropriate county of work being performed.</p>
  </div>
  
  <!-- Contract Value -->
  <div class="section">
    <div class="section-title">CONTRACT VALUE</div>
    <div class="pricing-section">`;

  // Add pricing details
  const pricing = get(contractDetails, 'pricing', {});
  const basePrice = get(pricing, 'basePrice', 0);
  const optionsTotal = get(pricing, 'optionsTotal', 0);
  const discount = get(pricing, 'discount', 0);
  const total = get(pricing, 'total', basePrice);

  html += `
      <div class="pricing-row">
        <span>${get(contractDetails, 'documentType', 'Proposal').charAt(0).toUpperCase() + get(contractDetails, 'documentType', 'proposal').slice(1)} for Painting Services:</span>
        <span>$${Number(basePrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>`;

  if (optionsTotal > 0) {
    html += `
      <div class="pricing-row">
        <span>Additional Services:</span>
        <span>$${Number(optionsTotal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>`;
  }

  if (discount) {
    html += `
      <div class="pricing-row">
        <span>Discount Applied:</span>
        <span>-$${discount.toString().includes('%') ? (basePrice * parseFloat(discount) / 100).toFixed(2) : Number(discount).toFixed(2)}</span>
      </div>`;
  }

  html += `
      <div class="pricing-row total">
        <span>TOTAL CONTRACT VALUE:</span>
        <span>$${Number(total).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>
    </div>
    
    <p style="text-align: center; margin-top: 10px;">
      <em>A ${get(contractDetails, 'paymentSchedule', '50%').includes('50') ? '20%' : '50%'} DEPOSIT IS DUE UPON EXECUTION OF CONTRACT WITH BALANCE DUE UPON DAY OF COMPLETION</em>
    </p>
    
    <p style="text-align: center; margin-top: 10px;">
      Please note that a 3.5% convenience fee will be applied to all payments made using a credit card.
    </p>
    
    <p style="text-align: center; margin-top: 10px;">
      This proposal is subject to acceptance within thirty (30) days and is void thereafter at the option of Hartzell.
    </p>
  </div>
  
  <!-- Footer info for page 1 -->
  <div class="page-footer">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
      <span>BROWARD</span>
      <span>PALM BEACH</span>
      <span>CBC1617138</span>
      <span>MIAMI-DADE</span>
      <span>MARTIN</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>89-5201-P</span>
      <span>U-18217</span>
      <span>www.MYHARTZELL.com</span>
      <span>1180001</span>
      <span>SP02651</span>
    </div>
  </div>
  
  <!-- Page Break -->
  <div class="page-break"></div>
  
  <!-- Page 2 -->
  <div style="margin-top: 40px;">
    <div style="text-align: left; margin-bottom: 20px;">
      <strong>${clientName}<br>
      ${get(contractDetails, 'documentType', 'PROPOSAL').toUpperCase()} FOR PAINTING SERVICES<br>
      ${formatDate(today)}<br>
      Page 2 of 3</strong>
    </div>
    
    <!-- Terms -->
    <div class="terms-box">
      <div class="title">TERMS</div>
      <p>The term "Final Completion" as used in this Agreement shall mean where the Client is satisfied that the work has been completed, any applicable municipally has given its final approval, and Hartzell's other obligations under the Agreement have been fulfilled.</p>
      
      <p>All payments for goods, materials, equipment, costs, labor, services rendered and any other financial obligation of the Client, are due the day of completion. Any invoice not paid within ten (10) days shall be subject to interest at 1.50% per month.</p>
      
      <p><strong>Attorney's Fees, Jurisdiction, and Venue:</strong> Hartzell, or the prevailing party if a lawsuit is filed, shall be entitled to recover all its attorney's fees, costs, expenses, and any other fees incurred in connection with collecting any amounts due and owing under this Proposal/Agreement. This provision includes invoices which remain outstanding for more than sixty (60) days. This entitlement shall include in pursuit, in litigation, in mediation, in arbitration, at all appellate levels, in bankruptcy, and for the collection and enforcement of any judgment. This also includes all attorney's fees and costs for litigating entitlement to attorney's fees and costs and determining the number of recoverable attorneys' fees and costs. Florida law shall apply to this Proposal/Agreement and the exclusive jurisdiction and venue for any dispute relating to, or arising out of, this Proposal/Agreement shall be instituted in the appropriate Circuit or County Court for the 17th Judicial Circuit in and for Broward County, Florida. Each party consents to personal jurisdiction, subject matter jurisdiction, and venue in Broward County, Florida.</p>
    </div>
    
    <!-- General Provisions -->
    <div class="section">
      <div class="section-title">GENERAL PROVISIONS</div>
      
      <p><strong>Delay/Damages:</strong> Hartzell shall not be responsible for delay caused by the Client, any owner, resident, or tenant, any other person or entity hired by the Client, any other entity or person over whom Hartzell has no control, an act of God, or force majeure. Force majeure shall mean, by way of example, and not in limitation, fire, governmental act, delay in government inspections, national emergency, strike, labor dispute, unusual delay in transportation, inability to procure materials, adverse weather, and unavoidable casualties, and other causes beyond Hartzell's control. To the extent the delay is caused by the Client, any owner, resident, or tenant, or any other person or entity hired by the Client, then Client shall be responsible to Hartzell for all Hartzell's actual costs caused by such a delay. Should the Client terminate Hartzell or otherwise cancel any proposal or agreement with Hartzell without good cause, the Client will be responsible to Hartzell for all service already provided, for all materials already provided or ordered, and any other actual costs that have been expended by Hartzell, including, but not limited to, for overhead, mobilization, and lost profits.</p>
      
      <p><strong>Acceptance, Understanding, and Benefit to Others:</strong> This Proposal/Agreement shall be deemed to have been fully accepted when executed by the Client. It shall be deemed to have set forth the entire understanding and agreement between the parties to this Proposal/Agreement and supersedes all previous understandings, written or oral, relating to the subject matter of this Proposal/Agreement. This Proposal/Agreement, upon acceptance by the Client, may only be amended, modified, or supplemented by a written instrument signed by the Party against whom it is sought to be enforced. All the terms and provisions to this Proposal/Agreement shall be deemed to apply, and be incorporated therein, to any subsequent proposal or agreement between the parties to this Proposal/Agreement. This Proposal/Agreement shall not be deemed to benefit any party not a party to this Proposal/Agreement.</p>
      
      <p><strong>Authority to Bind:</strong> The persons executing this Proposal/Agreement represent and warrant that they have the full authority and power to sign, on behalf of the party for whom they are signing, and that their signature on this Proposal/Agreement shall be binding on such party. For Association Clients, said representation includes that no further action, such as the approval of a Board of Directors, is required.</p>
      
      <p><strong>Mutual Negotiations:</strong> This Proposal/Agreement was created through mutual negotiations with each party having consulted with, or having had the opportunity to consult with, counsel. As such, the doctrine of contra proferentem shall not apply against any party to this Proposal/Agreement.</p>
    </div>
  </div>
  
  <!-- Page Break -->
  <div class="page-break"></div>
  
  <!-- Page 3 - Signature Page -->
  <div style="margin-top: 40px;">
    <div style="text-align: left; margin-bottom: 20px;">
      <strong>${clientName}<br>
      ${get(contractDetails, 'documentType', 'PROPOSAL').toUpperCase()} FOR PAINTING SERVICES<br>
      ${formatDate(today)}<br>
      Page 3 of 3</strong>
    </div>
    
    <div style="margin-top: 40px; margin-bottom: 60px;">
      <p>This Agreement between <strong>${clientName}</strong> and Hartzell Painting is accepted and agreed</p>
      <p>upon this _______ day of _____________, 2024.</p>
    </div>
    
    <div class="signature-section">
      <div class="signature-block left">
        <div style="margin-bottom: 40px;">
          <strong>${clientName}</strong><br>
          By:
        </div>
        <div class="signature-line"></div>
        <div class="signature-label">(Signature)</div>
      </div>
      
      <div class="signature-block">
        <div style="margin-bottom: 40px;">
          <strong>Hartzell Painting</strong><br>
          By:
        </div>
        <div class="signature-line"></div>
        <div class="signature-label">Senior Vice President, Project Manager</div>
      </div>
    </div>
    
    <!-- Large Hartzell Watermark/Logo at bottom -->
    <div style="text-align: center; margin-top: 100px;">
      <div style="font-size: 48pt; font-weight: bold; color: #e0e0e0; opacity: 0.3;">
        HARTZELL
      </div>
      <div style="font-size: 24pt; color: #e0e0e0; opacity: 0.3; margin-top: -20px;">
        YEARS
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

// Export for use in other scripts
window.generateHartzellContract = generateHartzellContract;