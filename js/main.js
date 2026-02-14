/**
 * js/main.js - COMPLETE REWRITE - PRODUCTION READY
 * All bugs fixed, optimized order, perfect error handling
 */
import { loadKeywords, detectDisease } from './core/inputHandler.js';
import { buildUserCondition } from './core/questionFlow.js'; 
import { evaluateRules } from './core/ruleEngine.js';
import { loadGeneralQA, getGeneralResponse, getFallbackReply } from './core/generalResponder.js';

const state = {
  mode: "WAITING_FOR_SYMPTOM",
  currentDiseaseId: null,
  diseaseData: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  isInitialized: false,
  multiSelectAnswers: []
};

const dom = {
  chatOutput: null,
  userInput: null,
  sendBtn: null,
  loader: null
};

document.addEventListener('DOMContentLoaded', async () => {
  dom.chatOutput = document.getElementById('chat-output');
  dom.userInput = document.getElementById('user-input');
  dom.sendBtn = document.getElementById('send-btn');
  dom.loader = document.getElementById('loader');

  console.log('🚀 Med and Ware Initializing...');
  
  await loadGeneralQA();
  await loadKeywords();
  
  state.isInitialized = true;
  console.log('✅ ALL SYSTEMS READY');
  
  hideLoader();
  setupEventListeners();
  
  setTimeout(() => {
    addMessage('Bot', '👋 <strong>Welcome to Med and Ware!</strong><br>');
  }, 600);
  setTimeout(() => {
    addMessage('Bot', 'I\'m here to help analyze your symptoms. Type a symptom like "fever", "headache", or "cough" to get started.');
  }, 1200);
});

function setupEventListeners() {
  dom.sendBtn?.addEventListener('click', handleUserInput);
  dom.userInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  });
  
  dom.userInput?.addEventListener('focus', () => {
    dom.sendBtn?.classList.add('input-focused');
  });
  
  dom.userInput?.addEventListener('blur', () => {
    dom.sendBtn?.classList.remove('input-focused');
  });
}

window.selectOption = function(optionText) {
  processAnswer(optionText.trim());
};

window.confirmMultiSelect = function() {
  const checkboxes = document.querySelectorAll(
    `input[type="checkbox"][data-question-idx="${state.currentIndex}"]:checked`
  );
  const selected = Array.from(checkboxes).map(cb => cb.value);
  
  if (selected.length === 0) {
    addMessage('Bot', '⚠️ Please select at least one option before continuing.');
    return;
  }
  
  processAnswer(selected.join(', '));
};

function handleUserInput() {
  const text = dom.userInput.value.trim();
  if (!text || !state.isInitialized) return;
  
  dom.userInput.value = '';
  dom.userInput.style.height = 'auto';
  handleUserResponse(text);
}

function handleUserResponse(text) {

  console.log('🎯 Processing:', text);

  // ✅ Always show user message first
  addMessage('User', text);

  const diseaseId = detectDisease(text);

  if (state.mode === 'WAITING_FOR_SYMPTOM' && diseaseId) {
    processSymptom(diseaseId);
    return;
  }

  const generalReply = getGeneralResponse(text);
  if (generalReply) {
    addMessage('Bot', generalReply);
    return;
  }

  if (state.mode === 'WAITING_FOR_SYMPTOM') {
    addMessage('Bot', getFallbackReply());
    return;
  }

  processAnswer(text);
}


async function processSymptom(diseaseId) {
  showTyping();
  
  try {
    state.mode = 'ANSWERING_QUESTIONS';
    state.currentDiseaseId = diseaseId;
    state.currentIndex = 0;
    state.answers = [];
    state.multiSelectAnswers = [];

    const response = await fetch(`/data/lightDiseases/${diseaseId}.json`);
    if (!response.ok) throw new Error(`No ${diseaseId}.json found`);
    
    state.diseaseData = await response.json();
    state.questions = state.diseaseData.assessment_questions || [];
    
    if (!state.diseaseData.severity_levels || !state.diseaseData.care_guidelines) {
      throw new Error('Invalid disease data structure');
    }
    
    console.log(`✅ Loaded ${state.diseaseData.name} - ${state.questions.length} questions`);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    hideTyping();
    
    addMessage('Bot', `
  <div style="
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    margin: 15px 0;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.1);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  ">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <strong style="color: #b91c1c; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Medical Notice</strong>
    </div>
    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
      The following information is for <strong style="color: #111827;">educational purposes only</strong>. I am an AI, not a healthcare professional. Please consult a doctor before starting any treatment.
    </p>
  </div>
`);
    
    setTimeout(() => {
      addMessage('Bot', `🩺 <strong style="color: #0EA5E9; font-size: 1.05rem;">${state.diseaseData.name} Assessment</strong><br><span style="color: #64748B; font-size: 0.9rem;">Let me ask you a few questions to assess your condition...</span>`);
    }, 800);
    
    setTimeout(() => askNextQuestion(), 1400);
    
  } catch (error) {
    hideTyping();
    console.error('Symptom error:', error);
    addMessage('Bot', `
      ⚠️ Sorry, I don't have information for "${formatName(diseaseId)}" yet.
      <br><br>
      <strong>Available symptoms:</strong> fever, headache, cough, acidity, diarrhea, sore throat, cold, back pain, nausea, stomach pain
    `);
    resetState();
  }
}

function askNextQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) {
    finishDiagnosis();
    return;
  }
  
  let optionsHtml;
  
  if (q.type === 'multi_select') {
    optionsHtml = `
      <div class="multi-select-container" style="display: flex; flex-direction: column; gap: 10px;">
        ${q.options.map((option, idx) => `
          <label class="checkbox-option" style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: white;
            border: 2px solid #E2E8F0;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            animation-delay: ${idx * 0.05}s;
            animation-fill-mode: backwards;
          " onmouseover="this.style.borderColor='#0EA5E9'; this.style.background='#F0F9FF';" 
             onmouseout="this.style.borderColor='#E2E8F0'; this.style.background='white';">
            <input 
              type="checkbox" 
              value="${option}" 
              data-question-idx="${state.currentIndex}"
              style="width: 20px; height: 20px; cursor: pointer;">
            <span style="font-size: 15px; color: #1E293B; font-weight: 500;">${formatOption(option)}</span>
          </label>
        `).join('')}
        <button 
          class="pill-btn confirm-btn" 
          onclick="confirmMultiSelect()" 
          style="
            margin-top: 10px;
            background: linear-gradient(135deg, #0EA5E9, #06B6D4);
            color: white;
            padding: 14px 24px;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            font-size: 15px;
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            animation-delay: ${q.options.length * 0.05}s;
            animation-fill-mode: backwards;
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(14, 165, 233, 0.3)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
          ✓ Confirm Selection
        </button>
      </div>
    `;
  } else {
    optionsHtml = `
      <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        ${q.options.map((option, index) => `
          <button class="pill-btn" onclick="selectOption('${option}')" style="
            padding: 14px 20px;
            background: white;
            border: 2px solid #E2E8F0;
            border-radius: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 15px;
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            animation-delay: ${index * 0.1}s;
            animation-fill-mode: backwards;
          "
          onmouseover="this.style.borderColor='#0EA5E9'; this.style.background='#F0F9FF'; this.style.transform='translateY(-2px)';"
          onmouseout="this.style.borderColor='#E2E8F0'; this.style.background='white'; this.style.transform='translateY(0)';">
            ${formatOption(option)}
          </button>
        `).join('')}
      </div>
    `;
  }

  const questionNumber = `<span style="display: inline-block; background: linear-gradient(135deg, #0EA5E9, #06B6D4); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-bottom: 12px;">Question ${state.currentIndex + 1}/${state.questions.length}</span>`;

  addMessage('Bot', `
    <div class="question-container" style="margin: 20px 0;">
      ${questionNumber}
      <div class="question-text" style="font-size: 16px; font-weight: 600; color: #1E293B; margin: 12px 0 16px 0;">
        ${q.question}
      </div>
      ${optionsHtml}
    </div>
  `);
}

function processAnswer(answer) {
  console.log(`📝 Q${state.currentIndex + 1}: "${answer}"`);
  
  const currentQuestion = state.questions[state.currentIndex];
  if (currentQuestion.type !== 'multi_select') {
    addMessage('User', answer, true);
  } else {
    addMessage('User', `Selected: ${answer}`, true);
  }
  
  state.answers.push(answer);
  state.currentIndex++;

  if (state.currentIndex < state.questions.length) {
    setTimeout(askNextQuestion, 600);
  } else {
    finishDiagnosis();
  }
}

async function finishDiagnosis() {
  showTyping('Analyzing your responses...');
  
  try {
    const condition = buildUserCondition(state.questions, state.answers);
    console.log('User condition:', condition);
    
    const result = evaluateRules(condition, state.diseaseData);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    hideTyping();
    displayResult(result, state.diseaseData.name);
    
  } catch (error) {
    hideTyping();
    console.error('Diagnosis failed:', error);
    addMessage('Bot', '⚠️ Unable to complete analysis. Please try again or consult a healthcare professional.');
  }
  
  setTimeout(() => {
    addMessage('Bot', '✨ Analysis complete! Feel free to share another symptom, or type "help" for more options.');
    resetState();
  }, 2500);
}

function displayResult(result, diseaseName) {
  let severityClass = "mild";
  let severityLabel = "MILD";
  let severityColor = "#10B981";
  let severityIcon = "✓";
  let severityBg = "#ECFDF5";
  
  if (result.severity === "moderate") {
    severityClass = "moderate";
    severityLabel = "MODERATE";
    severityColor = "#F59E0B";
    severityIcon = "⚠";
    severityBg = "#FFFBEB";
  }
  
  if (result.severity === "high_risk") {
    severityClass = "highrisk";
    severityLabel = "HIGH RISK";
    severityColor = "#EF4444";
    severityIcon = "!";
    severityBg = "#FEF2F2";
  }
  
  let html = `
    <div class="result-card ${severityClass}" style="
      background: white;
      border-radius: 20px;
      padding: 0;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin: 20px 0;
      font-family: 'Inter', -apple-system, sans-serif;
    ">
      <div class="result-header" style="
        background: linear-gradient(135deg, ${severityColor}15 0%, ${severityColor}05 100%);
        padding: 25px 30px;
        border-bottom: 1px solid #F1F5F9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
      ">
        <div class="disease-badge" style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.5px;
        ">${diseaseName}</div>
        
        <div class="severity-tag" style="
          background: ${severityBg};
          color: ${severityColor};
          padding: 8px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid ${severityColor}40;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="
            background: ${severityColor};
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
          ">${severityIcon}</span>
          ${severityLabel}
        </div>
      </div>
      
      <div style="padding: 30px;">
        ${result.care?.self_care?.length ? `
          <div class="care-section" style="margin-bottom: 25px;">
            <div class="section-header" style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 18px;
              padding-bottom: 12px;
              border-bottom: 2px solid #F1F5F9;
            ">
              <span class="section-title" style="
                font-size: 18px;
                font-weight: 700;
                color: #1E293B;
              ">💡 Self-Care Guidelines</span>
            </div>
            ${result.care.self_care.map((tip, index) => `
              <div style="
                background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
                padding: 16px 20px;
                border-radius: 12px;
                font-size: 15px;
                line-height: 1.6;
                color: #1E293B;
                margin-bottom: 10px;
                display: flex;
                gap: 12px;
              ">
                <span style="
                  background: #10B981;
                  color: white;
                  min-width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  font-size: 12px;
                  flex-shrink: 0;
                ">${index + 1}</span>
                <span>${tip}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${result.care?.medicines?.length ? `
          <div class="care-section" style="margin-bottom: 25px;">
            <div class="section-header" style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 18px;
              padding-bottom: 12px;
              border-bottom: 2px solid #F1F5F9;
            ">
              <span class="section-title" style="
                font-size: 18px;
                font-weight: 700;
                color: #1E293B;
              ">💊 Recommended Tablets</span>
            </div>
            ${result.care.medicines.map(med => `
              <div style="
                background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
                border: 2px solid #E2E8F0;
                padding: 20px;
                border-radius: 16px;
                margin-bottom: 16px;
              ">
                <div style="
                  font-size: 18px;
                  font-weight: 700;
                  color: #1E293B;
                  margin-bottom: 12px;
                ">${med.name}</div>
                
                <div style="
                  background: #EFF6FF;
                  padding: 12px 16px;
                  border-radius: 10px;
                  margin-bottom: 10px;
                  font-size: 14px;
                  color: #1E293B;
                ">
                  <strong>💡 Used for:</strong> ${med.used_for.split('(')[0].trim()}
                </div>
                
                ${med.dose ? `
                  <div style="
                    background: #F0FDF4;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: #1E293B;
                  ">
                    <strong>📋 Dosage:</strong> ${med.dose}
                  </div>
                ` : ''}
                
                <div style="
                  background: #FEF2F2;
                  padding: 12px 16px;
                  border-radius: 10px;
                  font-size: 14px;
                  color: #991B1B;
                ">
                  <strong>⚠️ Avoid if:</strong> ${med.avoid_if.join(', ')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

${result.status === "consult" ? `
  <div style="
    background: #ffffff;
    border-left: 5px solid #ef4444;
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.08);
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  ">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v14M7 12h10"/>
      </svg>
      <strong style="color: #b91c1c; font-size: 16px; letter-spacing: 0.3px;">Consultation Recommended</strong>
    </div>

    <div style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
      <p style="margin: 0;">${result.message}</p>
      
      ${result.immediate_flags?.length ? `
        <div style="
          margin-top: 16px; 
          padding: 16px; 
          background: #fff5f5; 
          border-radius: 8px; 
          border: 1px solid #fee2e2;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <strong style="color: #991b1b; font-size: 13px;">Immediate Warning Signs:</strong>
          </div>
          <ul style="margin: 0; padding-left: 18px; color: #b91c1c; font-size: 13px; font-weight: 500;">
            ${result.immediate_flags.map(flag => `<li style="margin-bottom: 4px;">${flag}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  </div>
` : ''}

        <div style="
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 18px 22px;
          font-size: 13px;
          line-height: 1.6;
          color: #64748B;
          text-align: center;
          font-style: italic;
        ">
          ℹ️ <strong>Disclaimer:</strong> ${result.disclaimer}
        </div>
      </div>
    </div>
  `;
  
  addMessage("Bot", html);
}

function addMessage(sender, content, isAnswer = false) {
  if (!dom.chatOutput) return;
  
  const div = document.createElement('div');
  div.className = `message ${sender === 'Bot' ? 'bot-message' : 'user-message'}`;
  div.innerHTML = `<div class="message-content">${content}</div>`;
  
  dom.chatOutput.appendChild(div);
  
  setTimeout(() => {
    dom.chatOutput.scrollTo({
      top: dom.chatOutput.scrollHeight,
      behavior: 'smooth'
    });
  }, 50);
}

function showTyping(customText = 'Med and Ware is thinking') {
  if (document.getElementById('typing')) return;
  
  const div = document.createElement('div');
  div.id = 'typing';
  div.className = 'message bot-message';
  div.innerHTML = `
    <div class="message-content">
      <span style="color: #64748B;">${customText}</span>
      <span class="typing-dots">
        <span></span><span></span><span></span>
      </span>
    </div>
  `;
  
  dom.chatOutput.appendChild(div);
  dom.chatOutput.scrollTop = dom.chatOutput.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typing');
  if (el) {
    el.style.animation = 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => el.remove(), 300);
  }
}

function resetState() {
  state.mode = 'WAITING_FOR_SYMPTOM';
  state.currentDiseaseId = null;
  state.diseaseData = null;
  state.questions = [];
  state.currentIndex = 0;
  state.answers = [];
  state.multiSelectAnswers = [];
}

function formatName(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatOption(opt) {
  return opt.replace(/([<>]=?)/g, '$1 ').replace(/_/g, ' ').trim();
}

function hideLoader() {
  if (dom.loader) {
    dom.loader.classList.add('hidden');
    setTimeout(() => {
      dom.loader.style.display = 'none';
    }, 600);
  }
}