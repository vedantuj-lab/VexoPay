import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getFinancialInsights(transactions: Transaction[], budget: number) {
  if (transactions.length === 0) return "Add some transactions to get AI-powered financial insights!";

  const summary = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc.expenses += t.amount;
      acc.categories[t.category] = (acc.categories[t.category] || 0) + t.amount;
    } else {
      acc.income += t.amount;
    }
    return acc;
  }, { income: 0, expenses: 0, categories: {} as Record<string, number> });

  const prompt = `
    As a smart financial advisor, analyze the following monthly financial data and provide 3-4 concise, actionable insights or tips.
    
    Total Income: $${summary.income}
    Total Expenses: $${summary.expenses}
    Monthly Budget: $${budget}
    
    Expense Breakdown by Category:
    ${Object.entries(summary.categories).map(([cat, amt]) => `- ${cat}: $${amt}`).join('\n')}
    
    Provide your response in a friendly, encouraging tone. Focus on saving tips, overspending alerts, and general financial health.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "I'm having trouble analyzing your data right now. Please try again later.";
  }
}
