import { X, Sparkles, User, ArrowRight } from "lucide-react";

const PERSONAS = [
  {
    id: "rural_artisan_woman",
    badge: "Rural Woman Artisan",
    emoji: "👩‍🎨",
    title: "Sunita Devi — Handloom & Pottery",
    location: "Varanasi, Uttar Pradesh",
    category: "SC",
    state: "Uttar Pradesh",
    sector: "Handicrafts",
    business_stage: "early",
    age: 32,
    annual_income: 120000,
    funding_need: 150000,
    business_description: "I make handwoven textiles and traditional terracotta pottery. I want to buy an electric potter wheel and sell my handloom sarees online directly to customers.",
    pitch: "Discovers Stand-Up India, PM Vishwakarma, ODOP & PMEGP with high rural subsidies."
  },
  {
    id: "minority_food_entrepreneur",
    badge: "Minority Food Founder",
    emoji: "🍱",
    title: "Zaid Khan — Bakery & Cloud Kitchen",
    location: "Kozhikode, Kerala",
    category: "Minority",
    state: "Kerala",
    sector: "Food processing",
    business_stage: "idea",
    age: 26,
    annual_income: 240000,
    funding_need: 350000,
    business_description: "Planning to start a cloud kitchen and bakery preparing traditional Malabar baked delicacies and packaged snacks with modern hygiene packaging.",
    pitch: "Matches NMDFC concessional loans, Mudra Kishor, and ASPIRE agro/food cluster support."
  },
  {
    id: "pwd_tech_artisan",
    badge: "PwD Innovator",
    emoji: "♿",
    title: "Ramesh Pawar — Leather Craft & E-comm",
    location: "Kolhapur, Maharashtra",
    category: "PwD",
    state: "Maharashtra",
    sector: "Manufacturing",
    business_stage: "existing",
    age: 38,
    annual_income: 180000,
    funding_need: 600000,
    business_description: "Existing workshop crafting authentic Kolhapuri leather footwear. I want to obtain quality certification, upgrade tools, and list products on GeM marketplace.",
    pitch: "Matches NHFDC, GeM Artisan Onboarding, ZED Zero-Defect certification, and Mudra Tarun."
  },
  {
    id: "women_shg_leader",
    badge: "Women Self-Help Group",
    emoji: "🤝",
    title: "Ananya Patil — Rural Coir & Agri-Allied",
    location: "Ratnagiri, Maharashtra",
    category: "Women",
    state: "Maharashtra",
    sector: "Manufacturing",
    business_stage: "early",
    age: 42,
    annual_income: 90000,
    funding_need: 200000,
    business_description: "Leading an 8-woman village self-help group producing coconut coir ropes, mats, and organic fertilizer from coconut husk residues.",
    pitch: "Matches Mahila Coir Yojana (75% subsidy), DAY-NRLM SHG bank loans, and Udyogini."
  }
];

export default function PersonaPresets({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold mb-2">
              <Sparkles size={13} /> SIH 2026 Judge Demo Presets
            </div>
            <h3 className="text-xl font-bold">Pick an Entrepreneur Persona</h3>
            <p className="text-indigo-200 text-xs mt-1">
              Demonstrates end-to-end AI matching across distinct marginalized demographics in 1 click
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Persona list */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {PERSONAS.map((persona) => (
            <div
              key={persona.id}
              onClick={() => {
                onSelect(persona);
                onClose();
              }}
              className="p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors">
                    {persona.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {persona.badge}
                      </span>
                      <span className="text-xs text-gray-500">{persona.location}</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 mt-1">{persona.title}</h4>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800 shrink-0 bg-indigo-50 group-hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  Match <ArrowRight size={14} />
                </button>
              </div>

              <p className="text-xs text-gray-600 italic bg-gray-50 group-hover:bg-white rounded-xl p-3 border border-gray-100 mt-2 mb-2">
                &ldquo;{persona.business_description}&rdquo;
              </p>

              <div className="text-[11px] text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/60 font-medium">
                🎯 <strong>Demo Target:</strong> {persona.pitch}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
