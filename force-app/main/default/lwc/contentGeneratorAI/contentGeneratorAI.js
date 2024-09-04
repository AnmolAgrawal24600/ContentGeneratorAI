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

    jsPdfInitialized = false;

    @api recordId;
    @track prompt = 'Write apex sample that sends an email to a customer';

    @track input_prompt;

    @track result;

    @track test_prompt;

    @track isModalOpen = false;

    @track is_pitchdocument = false;

    @track is_email_marketing = false;

    @track is_social_media = false;

    @track is_essentialdoc = false;


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
        console.log('Data saved');
        this.closeModal();
    }

    connectedCallback() {
        this.initializeTabs();
    }

    initializeTabs() {
        const tabs = this.template.querySelectorAll('.slds-tabs_default__link');

        tabs.forEach(tab => {
            tab.addEventListener('click', this.handleTabClick.bind(this));
        });
    }

    handleTabClick(event) {
        event.preventDefault();

        const clickedTab = event.currentTarget;
        const tabId = clickedTab.getAttribute('data-tab-id');

        this.template.querySelectorAll('.slds-tabs_default__link').forEach(tab => {
            tab.classList.remove('slds-is-active');
            tab.setAttribute('aria-selected', 'false');
        });

        this.template.querySelectorAll('.slds-tabs_default__content').forEach(content => {
            content.classList.add('slds-hide');
            content.classList.remove('slds-show');
        });

        clickedTab.classList.add('slds-is-active');
        clickedTab.setAttribute('aria-selected', 'true');

        const contentToShow = this.template.querySelector(`#${tabId}`);
        contentToShow.classList.remove('slds-hide');
        contentToShow.classList.add('slds-show');
    }

    handleButtonClick() {
        // this.input_prompt = `I am a marketing executive in HDFC bank and I would like to send a personalised content for the VP of potential lead at ${this.leadCompany} based on the HDFC Bank's interest in launching a co-branded health and wellness program aimed at their premium customers, including special financing options for medical expenses, discounts on medicines, and health check-up packages., ${this.leadCompany} with its extensive range of essential and specialty medications, along with a strong reputation in the ${this.leadIndustry} industry, could collaborate with HDFC Bank to offer exclusive discounts or benefits on their products through this program. The deal could include a marketing collaboration where their products are promoted through HDFC Bank's customer channels—such as mobile banking apps, websites, and customer newsletters—thereby expanding their brand visibility and customer reach`;

        // this.test_prompt = `I am a salesperson and trying to gather information about a company named ${this.leadCompany} which is my potential lead. Please provide me details like their products, services, their growth, some pain points and some of the industry details they are involved in.`

        generateEmail({ promptTextorId: this.prompt })
            .then(result => {
                this.result = result;
                this.isModalOpen = true;
                this.renderHTML();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    renderHTML() {
        contentContainer = document.getElementsByClassName('test-content');
        console.log('content', contentContainer);
        if (contentContainer) {
            contentContainer.innerHTML = "<h1>HDFC Bank Co-Branded Credit Card Pitch to Flipkart</h1> <p><strong>Date: September 22, 2021</strong></p> <p>Dear Flipkart Team,</p> <p>We are excited to present a new co-branded credit card partnership opportunity between HDFC Bank and Flipkart. This collaboration aims to leverage Salesforce's cutting-edge tools to enhance the partnership and provide unparalleled benefits to our customers.</p> <h2>Key Features of the HDFC Bank Flipkart Credit Card:</h2> <ul> <li>Exclusive discounts and offers on Flipkart purchases</li> <li>Reward points on every transaction, redeemable for Flipkart vouchers</li> <li>Zero annual fees for the first year</li> <li>Enhanced security features for safe online transactions</li> </ul> <h2>Benefits Over the Axis Flipkart Credit Card:</h2> <ul> <li>Higher reward points earning potential</li> <li>More exclusive discounts and offers on Flipkart</li> <li>Seamless integration with Salesforce tools for personalized customer experiences</li> </ul> <p>We believe that this co-branded credit card will not only drive customer loyalty but also boost sales for both HDFC Bank and Flipkart. Our partnership with Salesforce will ensure that we deliver a seamless and personalized experience to our cardholders.</p> <p>We look forward to discussing this exciting opportunity further and creating a successful partnership that benefits both our organizations and customers.</p> <p>Thank you for considering our proposal.</p> <p>Sincerely,</p> <p>[Your Name]<br> [Your Title]<br> HDFC Bank</p>";
        }
    }

    handleNameChange(event) {
        this.prompt = event.target.value;
    }
}