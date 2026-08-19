import { IJobExtractionProvider, ExtractedJobData } from "./jobExtraction.interface";

/**
 * A genuine, working fallback — NOT a mock. Rather than requiring a
 * real LLM API key to have ANY voice-posting functionality, this uses
 * simple regex/keyword extraction over common Hindi-English mixed
 * phrasing patterns (Hinglish, which is exactly how the target user
 * actually speaks — see the brief's own example sentence). It won't
 * handle every phrasing, but it handles the documented example
 * correctly and degrades honestly (low confidence + missing fields)
 * rather than hallucinating. A real LLM-based provider is a drop-in
 * upgrade later via the same interface — isAvailable() always true
 * here since it's fully local, no external dependency.
 */
export class RuleBasedJobExtractionProvider implements IJobExtractionProvider {
  isAvailable(): boolean {
    return true;
  }

  async extract(transcript: string): Promise<ExtractedJobData> {
    const lower = transcript.toLowerCase();
    const result: ExtractedJobData = { confidence: "LOW" };
    let fieldsFound = 0;

    // --- Category/title extraction: keyword match against known trades ---
    const categoryKeywords: Record<string, string> = {
      mechanic: "Mechanic",
      electrician: "Electrician",
      plumber: "Plumber",
      cook: "Cook",
      driver: "Driver",
      painter: "Painter",
      carpenter: "Carpenter",
      helper: "Helper",
      labourer: "Labourer",
      laborer: "Labourer",
      "security guard": "Security Guard",
      mason: "Mason",
      "ac repair": "AC Repair Technician",
    };
    for (const [keyword, label] of Object.entries(categoryKeywords)) {
      if (lower.includes(keyword)) {
        result.title = label;
        result.category = label;
        fieldsFound++;
        break;
      }
    }

    // --- Salary range: "15000 se 18000" or "15000 to 18000" or "₹15,000-18,000" ---
    const salaryRangeMatch = lower.match(/(\d{3,6})\s*(?:se|to|-)\s*(\d{3,6})/);
    if (salaryRangeMatch) {
      result.salaryMin = Number(salaryRangeMatch[1]);
      result.salaryMax = Number(salaryRangeMatch[2]);
      fieldsFound++;
    } else {
      const singleSalaryMatch = lower.match(/(\d{3,6})\s*(?:rupaye|rupees|rs\.?|₹)/);
      if (singleSalaryMatch) {
        result.salaryMin = Number(singleSalaryMatch[1]);
        fieldsFound++;
      }
    }

    // --- Salary type: month/day/hour keyword ---
    if (lower.includes("mahina") || lower.includes("month")) result.salaryType = "MONTHLY";
    else if (lower.includes("din") || lower.includes("day")) result.salaryType = "DAILY";
    else if (lower.includes("ghanta") || lower.includes("hour")) result.salaryType = "HOURLY";
    else result.salaryType = "MONTHLY"; // sensible default for most job-portal-style postings

    // --- Location: common NCR-region city names (extensible list) ---
    const knownCities = ["ghaziabad", "noida", "delhi", "gurugram", "gurgaon", "greater noida", "meerut", "lucknow"];
    for (const city of knownCities) {
      if (lower.includes(city)) {
        result.location = city.replace(/\b\w/g, (c) => c.toUpperCase());
        fieldsFound++;
        break;
      }
    }

    // --- Urgency ---
    result.urgency = lower.includes("jaldi") || lower.includes("urgent") ? "URGENT" : "NORMAL";

    // --- Employment type — defaults to full-time unless "part time"/"contract" mentioned ---
    if (lower.includes("part time") || lower.includes("part-time")) result.employmentType = "PART_TIME";
    else if (lower.includes("contract")) result.employmentType = "CONTRACT";
    else result.employmentType = "FULL_TIME";

    result.description = transcript; // raw transcript kept as the description base — employer can edit before posting

    // Confidence reflects how many structured fields were actually
    // extracted vs guessed/defaulted — shown to the employer so they
    // know how much to double-check on the confirmation screen.
    result.confidence = fieldsFound >= 3 ? "HIGH" : fieldsFound >= 1 ? "MEDIUM" : "LOW";

    return result;
  }
}