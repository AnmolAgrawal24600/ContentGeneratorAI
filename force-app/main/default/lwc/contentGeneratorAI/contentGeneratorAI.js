import { LightningElement, track, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import generateEmail from '@salesforce/apex/EinsteinLLMService.generateEmail';
import LEAD_NAME_FIELD from '@salesforce/schema/Lead.Name';
import LEAD_COMPANY_FIELD from '@salesforce/schema/Lead.Company';
import LEAD_DESCRIPTION_FIELD from '@salesforce/schema/Lead.Description';
import LEAD_INDUSTRY_FIELD from '@salesforce/schema/Lead.Industry';
import LEAD_STATUS_FIELD from '@salesforce/schema/Lead.Status';
import LEAD_REVENUE_FIELD from '@salesforce/schema/Lead.AnnualRevenue';

export default class ContentGeneratorAI extends LightningElement {

    @api recordId;
    @track prompt = 'Write apex sample that sends an email to a customer';
    @track result;
    @track isModalOpen = false;
    @track selectedType = 'Pitch Document';
    @track resultLoaded = false;

    documentTypes = [
        { label: 'Pitch Document', value: 'Pitch Document' },
        { label: 'Social Media Marketing', value: 'Social Media Marketing' },
        { label: 'Email Marketing', value: 'Email Marketing' },
        { label: 'Essential Document', value: 'Essential Document' }
    ];

    @wire(getRecord, { recordId: '$recordId', fields: [LEAD_NAME_FIELD, LEAD_COMPANY_FIELD, LEAD_DESCRIPTION_FIELD, LEAD_INDUSTRY_FIELD, LEAD_STATUS_FIELD, LEAD_REVENUE_FIELD] })
    lead;

    get leadName() {
        return getFieldValue(this.lead.data, LEAD_NAME_FIELD);
    }
    get leadCompany() {
        return getFieldValue(this.lead.data, LEAD_COMPANY_FIELD);
    }
    get leadDescription() {
        return getFieldValue(this.lead.data, LEAD_DESCRIPTION_FIELD);
    }
    get leadIndustry() {
        return getFieldValue(this.lead.data, LEAD_INDUSTRY_FIELD);
    }
    get leadStatus() {
        return getFieldValue(this.lead.data, LEAD_STATUS_FIELD);
    }
    get leadRevenue() {
        return getFieldValue(this.lead.data, LEAD_REVENUE_FIELD);
    }

    handleButtonClick() {
        this.resultLoaded = false;
        this.isModalOpen = true;
        this.generateContent();
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
    }

    generateContent() {
        let promptText = '';
        switch(this.selectedType) {
            case 'Pitch Document':
                promptText = `**Objective:** Craft a pitch document for HDFC Bank to present a new co-branded credit card to Flipkart, leveraging Salesforce's tools to enhance the partnership and highlight benefits over the Axis Flipkart credit card. Add signature and salutation as well. Include the system date where current date is needed`;
                break;
            case 'Social Media Marketing':
                promptText = `**Objective:** Develop social media content for HDFC Bank's new credit card in collaboration with Flipkart. Utilize Salesforce to create engaging and compelling posts that highlight benefits over the Axis Flipkart credit card.`;
                break;
            case 'Email Marketing':
                promptText = `**Objective:** Create a marketing campaign document for HDFC Bank's new Flipkart credit card, using Salesforce to enhance customer engagement and highlight advantages over the Axis Flipkart credit card for social media promotional content.`;
                break;
            case 'Essential Document':
                promptText = `**Objective:** Generate essential documentation for the HDFC Bank and Flipkart credit card partnership, including terms, conditions, and benefits. Ensure clarity and comprehensiveness in the documentation.`;
                break;
            default:
                promptText = `**Objective:** Generate content for the selected type.`;
        }

        generateEmail({ promptTextorId: promptText })
            .then(result => {
                this.result = result;
                this.resultLoaded = true;
                this.renderHTML();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    renderHTML() {
        if (this.resultLoaded) {
        const contentContainer = this.template.querySelector('[data-id="content-container-1"]');
        if (contentContainer) {
            contentContainer.innerHTML = this.result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        }
    }

    handleClose() {
        this.isModalOpen = false;
    }
}
