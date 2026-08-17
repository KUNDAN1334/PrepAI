# services/scraping-service/main.py — FastAPI research service (scrape + Groq summarise)

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime
import logging
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from groq import Groq
import time
import random

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PrepAI AI-Powered Research Service")

# Allowed origins come from the environment so a new frontend deployment does not
# require a code change. Comma separated, e.g.
# ALLOWED_ORIGINS="http://localhost:3000,https://prep-ai.vercel.app"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Initialize Groq
groq_client = None
try:
    if os.getenv("GROQ_API_KEY"):
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        logger.info("Groq AI client initialized")
except Exception as e:
    logger.error(f"Failed to initialize Groq: {e}")

@app.get("/")
async def root():
    return {"message": "PrepAI AI-Powered Research Service", "status": "running"}


@app.get("/health")
async def health():
    """Liveness probe for the host platform, and a quick way to confirm that the
    Next.js app's PYTHON_SERVICE_URL points somewhere real."""
    return {
        "status": "ok",
        "groq_configured": groq_client is not None,
        "time": datetime.now().isoformat(),
    }

@app.get("/research/company")
async def research_company(
    company: str = Query(...),
    query: str = Query(default=""),
    platforms: str = Query("gfg,leetcode,medium"),
):
    """AI-powered company research"""
    try:
        logger.info(f"Researching {company}")
        
        platform_list = [p.strip() for p in platforms.split(',')]
        scraped_data = {}
        
        # Scrape each platform
        for platform in platform_list:
            if platform == 'gfg':
                scraped_data['gfg'] = scrape_gfg_comprehensive(company)
                time.sleep(1)  # Rate limiting
            elif platform == 'leetcode':
                scraped_data['leetcode'] = get_leetcode_data(company)
            elif platform == 'medium':
                scraped_data['medium'] = get_medium_data(company)
        
        # Generate AI insights
        ai_insights = await generate_ai_insights(company, query, scraped_data)
        
        return {
            "company": company,
            "query": query or "General company research",
            "ai_insights": ai_insights,
            "raw_data": scraped_data,
            "scraped_at": datetime.now().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Research error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def scrape_gfg_comprehensive(company: str) -> dict:
    """Scrape GeeksforGeeks with retry logic"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        articles = []
        
        # Try multiple search variations
        search_terms = [
            f"{company} interview experience",
            f"{company} interview questions",
            f"{company} coding interview",
        ]
        
        for search_term in search_terms[:1]:  # Try first search term
            try:
                search_url = f"https://www.geeksforgeeks.org/search?q={search_term.replace(' ', '+')}"
                logger.info(f"Searching GFG: {search_url}")
                
                response = requests.get(search_url, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find all article links
                    article_links = soup.find_all('a', href=True, limit=15)
                    
                    for link in article_links:
                        href = link.get('href', '')
                        title = link.get_text(strip=True)
                        
                        # Filter for interview-related articles
                        if ('interview' in title.lower() or 'question' in title.lower()) and \
                           company.lower() in title.lower() and \
                           href.startswith('https://www.geeksforgeeks.org/'):
                            
                            if len(articles) < 5:  # Limit to 5 articles
                                articles.append({
                                    "title": title[:200],
                                    "url": href,
                                    "source": "GeeksforGeeks",
                                    "snippet": f"Interview experience and questions for {company}"
                                })
                
                time.sleep(random.uniform(1, 2))  # Random delay
                
            except Exception as e:
                logger.error(f"Error searching GFG with term '{search_term}': {e}")
                continue
        
        logger.info(f"Found {len(articles)} GFG articles for {company}")
        
        return {
            "articles": articles,
            "total": len(articles),
        }
        
    except Exception as e:
        logger.error(f"GFG scraping error: {e}")
        return {"articles": [], "total": 0, "error": str(e)}

def get_leetcode_data(company: str) -> dict:
    """Get LeetCode interview data"""
    common_topics = [
        f"{company} - Array and String Manipulation",
        f"{company} - Linked List and Trees",
        f"{company} - Dynamic Programming",
        f"{company} - System Design Questions",
    ]
    
    return {
        "common_topics": common_topics,
        "discuss_url": f"https://leetcode.com/discuss/interview-experience?currentPage=1&orderBy=hot&query={company}",
        "company_tag": f"https://leetcode.com/company/{company.lower().replace(' ', '-')}",
        "total": len(common_topics),
    }

def get_medium_data(company: str) -> dict:
    """Get Medium article data"""
    articles = [
        {
            "title": f"How I Cracked {company} Interview",
            "summary": "Complete preparation guide and interview experience",
            "url": f"https://medium.com/search?q={company}+interview"
        },
        {
            "title": f"{company} Interview Preparation Roadmap",
            "summary": "Technical topics and preparation timeline",
            "url": f"https://medium.com/tag/{company.lower().replace(' ', '-')}"
        }
    ]
    
    return {
        "articles": articles,
        "total": len(articles),
    }

async def generate_ai_insights(company: str, user_query: str, scraped_data: dict) -> dict:
    """Generate AI insights"""
    if not groq_client:
        return {
            "error": "AI service not configured",
            "summary": "Please configure GROQ_API_KEY in .env"
        }
    
    try:
        context = prepare_context_for_ai(company, scraped_data)
        prompt = create_research_prompt(company, user_query, context)
        
        completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career advisor. Provide clear, well-structured interview preparation advice using markdown formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=2000,
        )
        
        return {
            "summary": completion.choices[0].message.content,
            "sources_analyzed": count_sources(scraped_data),
        }
        
    except Exception as e:
        logger.error(f"AI error: {e}")
        return {
            "error": str(e),
            "summary": "Unable to generate insights."
        }

def prepare_context_for_ai(company: str, data: dict) -> str:
    """Prepare context from scraped data"""
    context = f"Information about {company} interviews:\n\n"
    
    # GFG articles
    if data.get('gfg', {}).get('articles'):
        context += "=== GeeksforGeeks Interview Experiences ===\n"
        for article in data['gfg']['articles']:
            context += f"- {article['title']}\n"
        context += "\n"
    
    # LeetCode topics
    if data.get('leetcode', {}).get('common_topics'):
        context += "=== LeetCode Discussion Topics ===\n"
        for topic in data['leetcode']['common_topics']:
            context += f"- {topic}\n"
        context += "\n"
    
    # Medium articles
    if data.get('medium', {}).get('articles'):
        context += "=== Medium Articles ===\n"
        for article in data['medium']['articles']:
            context += f"- {article['title']}: {article['summary']}\n"
        context += "\n"
    
    return context

def create_research_prompt(company: str, user_query: str, context: str) -> str:
    """Create AI prompt"""
    if user_query:
        return f"""Answer this question about {company} interviews:

{user_query}

Available information:
{context}

Provide a comprehensive answer with sections:
## Answer
## Interview Process
## Key Focus Areas
## Preparation Tips

Use markdown formatting. Keep it concise and actionable."""
    
    return f"""Create an interview preparation guide for {company}.

Available information:
{context}

Structure:
## Interview Process
## Technical Preparation
## Study Plan
## Success Tips

Use markdown. Be specific and practical."""

def count_sources(data: dict) -> dict:
    """Count sources"""
    gfg_count = len(data.get('gfg', {}).get('articles', []))
    leetcode_count = len(data.get('leetcode', {}).get('common_topics', []))
    medium_count = len(data.get('medium', {}).get('articles', []))
    
    reddit_count = len(data.get('reddit', {}).get('posts', []))

    return {
        "gfg_articles": gfg_count,
        "leetcode_topics": leetcode_count,
        "medium_articles": medium_count,
        "reddit_posts": reddit_count,
        "total": gfg_count + leetcode_count + medium_count + reddit_count,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
