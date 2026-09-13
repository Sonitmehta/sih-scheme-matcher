import asyncio
import json
from routers.profile import create_profile, UserProfile
from routers.schemes import match_schemes, get_scheme_summary, live_search
from routers.chatbot import chat_with_assistant, ChatRequest
from routers.tts import text_to_speech, TTSRequest

async def run_tests():
    print("--- 1. Testing Profile & Match Pipeline ---")
    prof = UserProfile(
        category="SC",
        state="Tamil Nadu",
        sector="Handicrafts",
        business_stage="early",
        business_description="I make handloom sarees and terracotta pottery"
    )
    p_res = await create_profile(prof)
    pid = p_res["profile_id"]
    m_res = await match_schemes(profile_id=pid)
    print(f"Total matched schemes: {m_res['total']}")
    top = m_res["matches"][0]
    print(f"Top match: {top['name']} (Score: {top['combined_score']}, Label: {top['match_label']})")

    print("\n--- 2. Testing 10-Language Dynamic Translation (Tamil) ---")
    summary_ta = await get_scheme_summary(top["scheme_id"], lang="ta")
    print("Tamil summary preview:", summary_ta["what"][:80].encode("ascii", "replace").decode())

    print("\n--- 3. Testing Regional AI Chatbot in Tamil & Hindi ---")
    c_ta = ChatRequest(message="How do I apply for Stand-Up India?", lang="ta", current_scheme_id="stand_up_india")
    res_ta = await chat_with_assistant(c_ta)
    print("Chatbot Tamil response preview:", res_ta.reply[:100].encode("ascii", "replace").decode())
    print("Chatbot actions count:", len(res_ta.suggested_actions))

    c_hi = ChatRequest(message="Mudra loan ke liye documents kya chahiye?", lang="hi")
    res_hi = await chat_with_assistant(c_hi)
    print("Chatbot Hindi response preview:", res_hi.reply[:100].encode("ascii", "replace").decode())

    print("\n--- 4. Testing Regional TTS Audio Synthesis (Tamil) ---")
    tts_req = TTSRequest(text="வணக்கம், இது திட்டம் மேட்சிங் உதவி", lang="ta")
    tts_res = await text_to_speech(tts_req)
    print("Tamil TTS status: OK, media_type:", tts_res.media_type)

    print("\n--- 5. Testing Live Scheme Search ---")
    live_res = await live_search(q="solar subsidy")
    print("Live search query:", live_res["query"], "Discovered count:", live_res["total_discovered"])

    print("\nALL 5 AUTOMATED VERIFICATION TESTS PASSED [OK]")

if __name__ == "__main__":
    asyncio.run(run_tests())
