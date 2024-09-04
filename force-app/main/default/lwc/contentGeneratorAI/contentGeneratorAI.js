import { LightningElement, track, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { loadScript } from 'lightning/platformResourceLoader';

import LEAD_NAME_FIELD from '@salesforce/schema/Lead.Name';
import LEAD_COMPANY_FIELD from '@salesforce/schema/Lead.Company';
import LEAD_DESCRIPTION_FIELD from '@salesforce/schema/Lead.Description';
import LEAD_INDUSTRY_FIELD from '@salesforce/schema/Lead.Industry';
import LEAD_STATUS_FIELD from '@salesforce/schema/Lead.Status';
import LEAD_REVENUE_FIELD from '@salesforce/schema/Lead.AnnualRevenue';
import generateEmail from '@salesforce/apex/EinsteinLLMService.generateEmail';

export default class ContentGeneratorAI extends LightningElement {

    jsPdfInitialized = false;

    @api recordId;
    @track prompt = 'Write apex sample that sends an email to a customer';

    @track input_prompt;

    @track result;

    @track test_prompt;

    @track isModalOpen = false;

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

    closeModal() {
        this.isModalOpen = false; // Close the modal
    }

    saveData() {
        // Handle data save or further actions
        console.log('Data saved');
        this.closeModal(); // Close the modal after saving data
    }

    // generatePDF() {
    //     if (this.jsPDFInitialized) {
    //         console.log('inside');
    //         const { jsPDF } = window.jspdf;
    //         console.log('inside 2');
    //         const doc = new jsPDF();
    //         console.log('inside 3');
    //         doc.text('Hello world!', 10, 10);
    //         console.log('doc', doc);
    //         doc.save('sample.pdf');
    //     }
    // }

    handleButtonClick() {

        this.isModalOpen = true;
                //this.input_prompt = `I am a marketing executive in HDFC bank and I would like to send a personalised content for the VP of potential lead at ${this.leadCompany} based on the HDFC Bank's interest in launching a co-branded health and wellness program aimed at their premium customers, including special financing options for medical expenses, discounts on medicines, and health check-up packages., ${this.leadCompany} with its extensive range of essential and specialty medications, along with a strong reputation in the ${this.leadIndustry} industry, could collaborate with HDFC Bank to offer exclusive discounts or benefits on their products through this program. The deal could include a marketing collaboration where their products are promoted through HDFC Bank's customer channels—such as mobile banking apps, websites, and customer newsletters—thereby expanding their brand visibility and customer reach`;

        //this.test_prompt = `I am a salesperson and trying to gather information about a company named ${this.leadCompany} which is my potential lead. Please provide me details like their products, services, their growth, some pain points and some of the industry details they are involved in.`

        generateEmail({ promptTextorId: this.prompt })
            .then(result => {
                this.result = result;
                this.renderHTML();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    handleNameChange(event) {
        this.prompt = event.target.value;
    }

    handleClose() {
        this.isModalOpen = false;
    }

    renderHTML() {
        const contentContainer = this.template.querySelector('[data-id="content-container-1"]');
        if (contentContainer) {
            contentContainer.innerHTML = this.result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
    }
    
}