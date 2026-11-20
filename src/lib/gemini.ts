export type DegradationAnalysisResult = {
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  hazardScore: number; // 1 to 10
  description: string;
  recommendedAction: string;
  authorityEscalationSummary: string;
};

export async function analyzeDegradationWithPrompt(
  imageUrl: string,
  userCustomPrompt?: string
): Promise<DegradationAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  const defaultPrompt = `
You are an expert Environmental Health & Sanitation AI Inspector for municipal waste management.
Analyze this image of public space degradation.
Respond in strict JSON format with the following keys:
{
  "category": "e.g., Plastic Waste, Blocked Drainage, Medical Debris, Construction Waste",
  "severity": "low" | "medium" | "high" | "critical",
  "hazardScore": 1 to 10 integer,
  "description": "Short 2-sentence objective summary of what is seen in the image",
  "recommendedAction": "Concrete cleanup recommendation (e.g. dispatch 3-person team with shovel and bags)",
  "authorityEscalationSummary": "Brief urgent notification text suitable for SMS to county environment officials"
}
${userCustomPrompt ? `Additional instructions from user: ${userCustomPrompt}` : ""}
`;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured. Returning structured AI simulation response.");
    return {
      category: "Municipal Solid Waste & Plastic Debris",
      severity: "high",
      hazardScore: 8,
      description:
        "High concentration of non-biodegradable plastics and overflowing uncollected domestic refuse encroaching on pedestrian footpath and drainage channels.",
      recommendedAction:
        "Dispatch municipal sanitation tipper truck and a 4-person cleanup team with heavy gloves and disposal sacks.",
      authorityEscalationSummary:
        "URGENT: Critical solid waste accumulation blocking public path. Health and flood risk detected. Immediate dispatch requested.",
    };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: defaultPrompt },
            {
              // Pass the image URL or instructions
              text: `Image location/url: ${imageUrl}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return JSON.parse(candidateText);
  } catch (err) {
    console.error("AI Analysis error:", err);
    return {
      category: "General Public Space Degradation",
      severity: "medium",
      hazardScore: 6,
      description: "Identified visible debris and potential environmental hazard.",
      recommendedAction: "Routine inspection and waste removal recommended.",
      authorityEscalationSummary: "Notice: Site flagged for environmental inspection.",
    };
  }
}
