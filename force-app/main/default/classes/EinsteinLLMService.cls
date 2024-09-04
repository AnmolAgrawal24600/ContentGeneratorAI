public with sharing class EinsteinLLMService {
    @AuraEnabled(cacheable=false)
    public static String generateEmail(String promptTextorId) {
        // Create the input
        ConnectApi.EinsteinLlmGenerationsInput generationsInput = new ConnectApi.EinsteinLlmGenerationsInput();
        generationsInput.promptTextorId = promptTextorId;
        generationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        generationsInput.additionalConfig.maxTokens = 512;
        generationsInput.additionalConfig.applicationName = 'CampaignApp';

        // Call the service
        ConnectApi.EinsteinLLMGenerationsOutput generationsOutput;
        try {
            generationsOutput = ConnectApi.EinsteinLLM.generateMessages(generationsInput);
        } catch (Exception e) {
            throw new AuraHandledException('Error calling Einstein LLM: ' + e.getMessage());
        }

        // Consume response
        if (generationsOutput != null && !generationsOutput.generations.isEmpty()) {
            ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
            return response.text;
        } else {
            return 'No response received.';
        }
    }
}