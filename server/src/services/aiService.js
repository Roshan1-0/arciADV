const OpenAI = require('openai');
const fallbackService = require('./fallbackService');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Generate architecture plan using GPT-4o.
 * Falls back to rule-based generator if AI fails.
 */
async function generateArchitecturePlan(req) {
  if (!openai) {
    console.log('⚠️  No OpenAI API key found. Using rule-based fallback.');
    const result = fallbackService.getRuleBasedArchitecture(req);
    return { ...result, ai_powered: false };
  }

  const systemPrompt = `You are an expert Cloud Infrastructure Architect.
Based on the following user requirements, design a production-ready cloud architecture for ${req.cloud_provider}.

Requirements:
- Application Type: ${req.app_type}
- Daily Users: ${req.users_daily}
- Database Type: ${req.db_type}
- Storage: ${req.storage_gb}
- Region: ${req.region}
- High Availability: ${req.high_availability}
- Security Level: ${req.security_level}
- Expected Uptime SLA: ${req.uptime}%
- Project Runtime: ${req.runtime_months} month(s)
${req.monthly_budget ? `- Monthly Budget: INR ${req.monthly_budget}` : ''}

Return your response strictly as a JSON object with this exact schema:
{
  "explanation": "A detailed paragraph explaining the architectural choices and why they suit the requirements.",
  "mermaid_diagram": "A valid Mermaid.js graph TD string representing the architecture. Include all relevant services.",
  "components": [
    {
      "type": "compute|database|storage|network|loadbalancer|cdn|cache|security",
      "service_name": "e.g., EC2 Auto Scaling, RDS PostgreSQL",
      "instance_size": "e.g., t3.medium, db.t3.large",
      "count": 2,
      "notes": "brief reason for this choice"
    }
  ]
}

Do not wrap the JSON in markdown blocks. Output raw JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      explanation: parsed.explanation,
      mermaid_diagram: parsed.mermaid_diagram,
      components: parsed.components,
      ai_powered: true,
    };
  } catch (error) {
    console.error(`❌ OpenAI API Error: ${error.message}. Using fallback.`);
    const result = fallbackService.getRuleBasedArchitecture(req);
    return { ...result, ai_powered: false };
  }
}

module.exports = { generateArchitecturePlan };
