import { LightningElement, track, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import LEAD_NAME_FIELD from '@salesforce/schema/Lead.Name';
import LEAD_COMPANY_FIELD from '@salesforce/schema/Lead.Company';
import LEAD_DESCRIPTION_FIELD from '@salesforce/schema/Lead.Description';
import LEAD_INDUSTRY_FIELD from '@salesforce/schema/Lead.Industry';
import LEAD_STATUS_FIELD from '@salesforce/schema/Lead.Status';
import LEAD_REVENUE_FIELD from '@salesforce/schema/Lead.AnnualRevenue';
import generateEmail from '@salesforce/apex/EinsteinLLMService.generateEmail';

export default class ContentGeneratorAI extends LightningElement {

    @api recordId;
    @track prompt = 'Write apex sample that sends an email to a customer';

    @track result;

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
        generateEmail({ promptTextorId: this.prompt })
            .then(result => {
                this.result = result;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    handleNameChange(event) {
        this.prompt = event.target.value;
    }
}