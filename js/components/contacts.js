function renderContacts() {
  const contactsContainer = document.getElementById('contacts-container');
  if (!contactsContainer) return;

  contactsContainer.innerHTML = '';

  // Render each contact
  formState.data.contacts.forEach((contact, index) => {
    const contactCard = document.createElement('div');
    contactCard.className = `${index > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}`;

    // Contact name field (full width)
    const nameField = document.createElement('div');
    nameField.className = 'mb-3';
    nameField.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
      <input type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Enter contact name"
            value="${contact.name || ''}">
    `;
    nameField.querySelector('input').addEventListener('input', function(e) {
      formState.updateContact(index, 'name', e.target.value);
    });

    // Phone and Email fields in the same row
    const contactInfoRow = document.createElement('div');
    contactInfoRow.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

    // Phone field
    const phoneField = document.createElement('div');
    phoneField.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
      <div class="relative">
        <input type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="123-456-7890"
              value="${contact.phone || ''}">
        <div class="text-xs text-gray-500 mt-1">Format: 123-456-7890</div>
      </div>
    `;
    const phoneInput = phoneField.querySelector('input');
    phoneInput.addEventListener('input', function(e) {
      // Auto-format the phone number as they type
      let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
      if (value.length > 0) {
        // Format the phone number
        if (value.length <= 3) {
          // Just the first 3 digits
        } else if (value.length <= 6) {
          value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
          value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
      }
      e.target.value = value;
      formState.updateContact(index, 'phone', value);

      // Visual validation feedback
      if (value && !formState.validatePhoneNumber(value)) {
        phoneInput.classList.add('border-red-500');
        phoneInput.classList.remove('border-gray-300'); /* removing green border */
      } else if (value && formState.validatePhoneNumber(value)) {
        phoneInput.classList.remove('border-red-500');
        phoneInput.classList.add('border-gray-300'); /* neutral gray instead of green */
      } else {
        phoneInput.classList.remove('border-red-500');
        phoneInput.classList.add('border-gray-300'); /* default gray border */
      }
    });

    // Email field
    const emailField = document.createElement('div');
    emailField.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <div class="relative">
        <input type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="example@domain.com"
              value="${contact.email || ''}">
        <div class="text-xs text-gray-500 mt-1">Must contain @ and a domain</div>
      </div>
    `;
    const emailInput = emailField.querySelector('input');
    emailInput.addEventListener('input', function(e) {
      const value = e.target.value;
      formState.updateContact(index, 'email', value);

      // Visual validation feedback
      if (value && !formState.validateEmail(value)) {
        emailInput.classList.add('border-red-500');
        emailInput.classList.remove('border-gray-300'); /* removing green border */
      } else if (value && formState.validateEmail(value)) {
        emailInput.classList.remove('border-red-500');
        emailInput.classList.add('border-gray-300'); /* neutral gray instead of green */
      } else {
        emailInput.classList.remove('border-red-500');
        emailInput.classList.add('border-gray-300'); /* default gray border */
      }
    });

    contactInfoRow.appendChild(phoneField);
    contactInfoRow.appendChild(emailField);

    contactCard.appendChild(nameField);
    contactCard.appendChild(contactInfoRow);

    // Action buttons
    const actionsRow = document.createElement('div');
    actionsRow.className = 'mt-4';

    if (index === 0) {
      // Add button for first contact
      const addButton = document.createElement('button');
      addButton.className = 'inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors py-1 px-2 rounded hover:bg-blue-50';
      addButton.innerHTML = '<i class="fas fa-plus mr-1.5"></i> Add';
      addButton.addEventListener('click', () => {
        formState.addContact();
        renderContacts(); // Re-render after adding
      });
      actionsRow.appendChild(addButton);
    } else {
      // Remove button for additional contacts
      const removeButton = document.createElement('button');
      removeButton.className = 'inline-flex items-center text-red-500 hover:text-red-700 text-sm font-medium transition-colors py-1 px-2 rounded hover:bg-red-50';
      removeButton.innerHTML = '<i class="fas fa-times mr-1.5"></i> Remove';
      removeButton.addEventListener('click', () => {
        formState.removeContact(index);
        renderContacts(); // Re-render after removing
      });
      actionsRow.appendChild(removeButton);
    }

    contactCard.appendChild(actionsRow);
    contactsContainer.appendChild(contactCard);
  });

  // Company section - directly with input, no subheader
  const companyCard = document.createElement('div');
  companyCard.className = 'mt-6 pt-6 border-t border-gray-200';

  const companyField = document.createElement('div');
  companyField.innerHTML = `
    <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
    <input type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          placeholder="Enter company name"
          value="${formState.data.companyData ? formState.data.companyData.name || '' : ''}">
  `;

  companyField.querySelector('input').addEventListener('input', function(e) {
    if (!formState.data.companyData) {
      formState.data.companyData = { name: e.target.value };
    } else {
      formState.data.companyData.name = e.target.value;
    }
    formState.saveState();
  });

  companyCard.appendChild(companyField);
  contactsContainer.appendChild(companyCard);
}
