/**
 * js/core/ruleEngine.js
 * MEDICALLY REALISTIC TRIAGE ENGINE
 * - Red flag detection (immediate escalation)
 * - Weighted scoring system
 * - No over-escalation
 */

import { normalizeCondition } from './questionFlow.js';

export function evaluateRules(userCondition, diseaseData) {
  const condition = normalizeCondition(userCondition);

  console.log('🔍 Evaluating condition:', condition);

  const severity = determineSeverity(condition, diseaseData);

  console.log(`📊 Final Severity: ${severity}`);

  if (severity === "high_risk") {
    return {
      status: "consult",
      severity,
      message: diseaseData.doctor_consultation?.message || "Consult doctor immediately.",
      immediate_flags: diseaseData.doctor_consultation?.immediate || [],
      disclaimer: diseaseData.disclaimer
    };
  }

  if (severity === "moderate") {
    return {
      status: "success",
      severity,
      care: diseaseData.care_guidelines,
      urgent_flags: diseaseData.doctor_consultation?.urgent || [],
      disclaimer: diseaseData.disclaimer
    };
  }

  return {
    status: "success",
    severity: "mild",
    care: diseaseData.care_guidelines,
    disclaimer: diseaseData.disclaimer
  };
}

/**
 * 🎯 REAL TRIAGE LOGIC
 */
function determineSeverity(condition, diseaseData) {

  // 1️⃣ RED FLAG CHECK (Immediate escalation)
  if (hasRedFlag(condition, diseaseData)) {
    console.log("🚨 RED FLAG detected");
    return "high_risk";
  }

  // 2️⃣ RISK SCORING
  const score = calculateRiskScore(condition);

  console.log(`🧮 Risk Score: ${score}`);

  if (score >= 3) return "high_risk";
  if (score === 2) return "moderate";
  return "mild";
}

/**
 * 🚨 RED FLAG DETECTION
 * Only true emergency symptoms trigger this
 */
function hasRedFlag(condition, diseaseData) {

  const redFlagsFromJSON = diseaseData.doctor_consultation?.immediate || [];
  const userSymptoms = (condition.other_symptoms || "").toLowerCase();

  for (const flag of redFlagsFromJSON) {
    if (userSymptoms.includes(flag.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * 🧮 WEIGHTED RISK SCORING
 * Each moderate factor adds points
 */
function calculateRiskScore(condition) {
  let score = 0;

  // Severe intensity adds 1
  if (condition.pain_level === "severe" ||
      condition.energy_level === "severe") {
    score += 1;
  }

  // Moderate intensity adds 1
  if (condition.pain_level === "moderate" ||
      condition.energy_level === "moderate") {
    score += 1;
  }

  // Prolonged duration adds 1
  if (condition.duration_days === ">3") {
    score += 1;
  }

  // Persistent vomiting adds 1
  if (condition.vomiting === "persistent") {
    score += 1;
  }

  // High fever adds 1
  if (condition.temperature === ">102°F") {
    score += 1;
  }

  // Moderate fever adds 1
  if (condition.temperature === "100.4-102°F") {
    score += 1;
  }

  return score;
}
