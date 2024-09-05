import { LightningElement, track, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import generateEmail from '@salesforce/apex/EinsteinLLMService.generateEmail';
import getEmailsByRecipient from '@salesforce/apex/EinsteinLLMService.getEmailsByRecipient';
import LEAD_NAME_FIELD from '@salesforce/schema/Lead.Name';
import LEAD_COMPANY_FIELD from '@salesforce/schema/Lead.Company';
import LEAD_DESCRIPTION_FIELD from '@salesforce/schema/Lead.Description';
import LEAD_INDUSTRY_FIELD from '@salesforce/schema/Lead.Industry';
import LEAD_STATUS_FIELD from '@salesforce/schema/Lead.Status';
import LEAD_REVENUE_FIELD from '@salesforce/schema/Lead.AnnualRevenue';
import LEAD_EMAIL_FIELD from '@salesforce/schema/Lead.Email';
import jsPDF from '@salesforce/resourceUrl/jsPDF';
import html2canvas from '@salesforce/resourceUrl/html2canvas';
import { loadScript } from 'lightning/platformResourceLoader';

export default class ContentGeneratorAI extends LightningElement {

    @api recordId;
    @track prompt = '';
    @track result;
    @track isModalOpen = false;
    @track selectedType = 'Pitch Document';
    @track resultLoaded = false;
    @track isEmailToggled = false;
    @track emails = [];
    html2canvasvar
    documentTypes = [
        { label: 'Pitch Document', value: 'Pitch Document' },
        { label: 'Social Media Marketing', value: 'Social Media Marketing' },
        { label: 'Email Marketing', value: 'Email Marketing' },
        { label: 'Essential Document', value: 'Essential Document' }
    ];

    @wire(getRecord, { recordId: '$recordId', fields: [LEAD_NAME_FIELD, LEAD_COMPANY_FIELD, LEAD_DESCRIPTION_FIELD, LEAD_INDUSTRY_FIELD, LEAD_STATUS_FIELD, LEAD_REVENUE_FIELD, LEAD_EMAIL_FIELD] })
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
    get leadEmail() {
        return getFieldValue(this.lead.data, LEAD_EMAIL_FIELD);
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
                promptText = `**Objective:** Craft a pitch document for HDFC Bank to present a new co-branded credit card to Flipkart, leveraging Salesforce's tools to enhance the partnership and highlight benefits over the Axis Flipkart credit card. Add signature and salutation as well. Include the system date where current date is needed. Also present the output in a markdown format.`;
                break;
            case 'Social Media Marketing':
                promptText = `**Objective:** Develop social media content for HDFC Bank's new credit card in collaboration with Flipkart. Utilize Salesforce to create engaging and compelling posts that highlight benefits over the Axis Flipkart credit card. Also present the output in a markdown format.`;
                break;
            case 'Email Marketing':
                promptText = `**Objective:** Create a marketing campaign document for HDFC Bank's new Flipkart credit card, using Salesforce to enhance customer engagement and highlight advantages over the Axis Flipkart credit card for social media promotional content. Also present the output in a markdown format.`;
                break;
            case 'Essential Document':
                promptText = `**Objective:** Generate essential documentation for the HDFC Bank and Flipkart credit card partnership, including terms, conditions, and benefits. Ensure clarity and comprehensiveness in the documentation. Also present the output in a markdown format.`;
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
            contentContainer.innerHTML = this.result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>');
            console.log(contentContainer.innerHTML);
        }
        }
    }

    handleClose() {
        this.isModalOpen = false;
    }

    handleNameChange(event) {
        this.prompt = event.target.value;
    }

    handleToggleChange() {
        this.isEmailToggled = !this.isEmailToggled;
        console.log("email", this.isEmailToggled);
        this.fetchEmails();
    }

    fetchEmails() {
        getEmailsByRecipient({ recipientEmail: this.leadEmail })
            .then(result => {
                this.emails = result;
                console.log("mails", this.emails[0].TextBody);
            })
            .catch(error => {
                console.error('Error fetching emails:', error);
            });
    }

    jsPdfInitialized = false;


    renderedCallback() {
        if (this.jsPdfInitialized) {
            return;
        }
        this.jsPdfInitialized = true;

        Promise.all([
            this.loadJsPDF(),
        ])
            .then(() => {
                console.log('Both libraries are loaded');
            })
            .catch(error => {
                console.error('Error loading one or both libraries:', error);
            });
    }

    loadJsPDF() {
        return loadScript(this, jsPDF)
            .then(() => {
                console.log('jsPDF loaded');
            })
            .catch(error => {
                console.error('Error loading jsPDF:', error);
            });
    }

    generatePDF() {
        this.generate();
    }

    generate() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'in', 'letter');
            doc.setTextColor(0, 0, 0); // Black color
            doc.setFontSize(12);
            // doc.setTextColor(0, 0, 255); // Blue color
            doc.text('hello world', 100, 100);
            // // Save the PDF
            doc.save('document.pdf');
        }
        catch (error) {
            alert("Error " + error);
        }
    }

}
