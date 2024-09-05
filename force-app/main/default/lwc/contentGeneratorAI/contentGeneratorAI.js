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
import { loadScript } from 'lightning/platformResourceLoader';

export default class ContentGeneratorAI extends LightningElement {

    @api recordId;
    @track prompt = '';
    @track suggestion = '';
    @track result = null;
    @track isModalOpen = false;
    @track selectedType = 'Proposal Document';
    @track resultLoaded = false;
    @track isEmailToggled = false;
    @track emails = [];
    html2canvasvar
    documentTypes = [
        { label: 'Proposal Document', value: 'Proposal Document' },
        // { label: 'Social Media Marketing', value: 'Social Media Marketing' },
        // { label: 'Email Marketing', value: 'Email Marketing' },
        { label: 'Additional Document', value: 'Additional Document' }
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
        this.result = null;
        this.isModalOpen = true;
        this.generateContent();
    }

    handleRegenerateClick() {
        this.resultLoaded = false;
        this.regenerateContent();
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
    }

    formattedDate() {
        // Array of month names
        var date = new Date();
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // Extract day, month, and year from the Date object
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // Format date as "12 Jan 2021"
        return `${day} ${monthNames[monthIndex]} ${year}`;
    }

    regenerateContent() {
        let promptText = `I have a document in html form given by ${this.result}. Please modify the document as per additional information given after this line.${this.suggestion}.Modify the document as minimum as possible. Also, represent the output in same html format with atleast 3 levels of heading.`;
        this.result = null;
        this.suggestion = '';

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

    generateContent() {
        let promptText = '';
        console.log('date', new Date().toLocaleDateString());
        switch(this.selectedType) {
            case 'Proposal Document':
                promptText = `**Objective:** Craft a detailed proposal document in about 1000 words for HDFC Bank to present a new co-branded credit card to Flipkart, leveraging Salesforce's tools to enhance the partnership and highlight benefits over the Axis Flipkart credit card. ${this.prompt}. Add signature and salutation as well. Name of the person from Flipkart is ${this.leadName}. Include this date instead of current date ${this.formattedDate()} if date is needed. Also represent the output in html format with proper formatting with atleast 3 levels of headings.`;
                break;
            case 'Social Media Marketing':
                promptText = `**Objective:** Develop social media content for HDFC Bank's new credit card in collaboration with Flipkart.${this.prompt}. Utilize Salesforce to create engaging and compelling posts that highlight benefits over the Axis Flipkart credit card. Also present the output in a markdown format.`;
                break;
            case 'Email Marketing':
                promptText = `**Objective:** Create a marketing campaign document for HDFC Bank's new Flipkart credit card, using Salesforce to enhance customer engagement and highlight advantages over the Axis Flipkart credit card for social media promotional content.${this.prompt}.Include this date instead of current date ${this.formattedDate()} if date is needed. Also present the output in a markdown format.`;
                break;
            case 'Additional Document':
                promptText = `**Objective:** Generate essential documentation for the HDFC Bank and Flipkart credit card partnership, including terms, conditions, and benefits in about 1000 words.${this.prompt}. Ensure clarity and comprehensiveness in the documentation.Include this date instead of current date ${this.formattedDate()} if date is needed.Also represent the output in html format with proper formatting with atleast 3 levels of headings.`;
                break;
            default:
                promptText = `**Objective:** Generate content for the selected type.`;
        }

        generateEmail({ promptTextorId: promptText })
            .then(result => {
                this.result = result;
                this.resultLoaded = true;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    handleClose() {
        this.result = null;
        this.resultLoaded = false;
        this.isModalOpen = false;
    }

    handleNameChange(event) {
        this.prompt = event.target.value;
    }

    handleSuggestionChange(event) {
        this.suggestion = event.target.value;
    }

    handleToggleChange() {
        this.isEmailToggled = !this.isEmailToggled;
        console.log("email", this.isEmailToggled);
        this.fetchEmails();
    }

    fetchEmails() {
        if (this.isEmailToggled) {
        getEmailsByRecipient({ recipientEmail: this.leadEmail })
            .then(result => {
                this.emails = result;
                console.log("mails", this.emails[0].TextBody);
            })
            .catch(error => {
                console.error('Error fetching emails:', error);
            });
        }
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
            doc.save('flipkart_pitch_doc.pdf');
        }
        catch (error) {
            alert("Error " + error);
        }
    }
    copyToClipboard() {
        const richTextEditor = this.template.querySelector('[data-id="richTextEditor"]');

        if (richTextEditor) {
            // Get the rich text content
            const htmlContent = richTextEditor.value;

            // Use the Clipboard API to copy HTML content
            navigator.clipboard.write([new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' }),
                'text/plain': new Blob([this.htmlToPlainText(htmlContent)], { type: 'text/plain' })
            })]).then(() => {
                alert('Content copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    }
    htmlToPlainText(html) {
        // Convert HTML to plain text with basic formatting preserved
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extract formatted text
        return tempDiv.innerText || tempDiv.textContent;
    }
    handleTextChange(event) {
        this.result = event.detail.value;
    }

    handleShowText() {
        alert(this.result);
    }

}
