import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time

# 1. 운동 리스트 페이지 렌더링
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("https://burnfit.io/exercise_library/")
time.sleep(5)

for _ in range(5):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1)

html = driver.page_source
soup = BeautifulSoup(html, "html.parser")
driver.quit()

# 2. 상세 페이지 링크 수집 (10개만)
exercise_urls = []
for a in soup.find_all("a", href=True):
    href = a["href"]
    if href.startswith("https://burnfit.io/라이브러리/"):
        exercise_urls.append(href)

exercise_urls = list(dict.fromkeys(exercise_urls))
print(f"🔗 수집된 링크 수: {len(exercise_urls)}")

# 3. 상세 페이지 정보 수집
results = []

for idx, url in enumerate(exercise_urls, start=1):
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")

        pt_name = soup.find("meta", property="og:title")["content"].split("-")[0].strip()
        desc = soup.find("meta", attrs={"name": "description"})["content"]
        pt_category = desc.split("|")[0].strip()
        # 이미지 URL 구성
        img_base = soup.find("meta", property="og:image:secure_url")["content"]
        img_base = ".".join(img_base.split(".")[:-1])  # 확장자 제거

        # png, gif 합쳐서 하나의 컬럼으로 저장
        pt_image = f"{img_base}.png,{img_base}.gif"
        
        # pt_content 수집
        content_ol = soup.find("ol")
        pt_content = ""

        if content_ol:
            pt_content = " | ".join([li.text.strip() for li in content_ol.find_all("li")])

        # 저장
        results.append([idx, pt_name, pt_category, pt_image, pt_content])
        
        print(f"[{idx}] ✅ {pt_name}")
    except Exception as e:
        print(f"[{idx}] ❌ {url} → {e}")

# 4. CSV 저장
df = pd.DataFrame(results, columns=["PT_IDX", "PT_NAME", "PT_CATEGORY", "PT_IMAGE", "PT_CONTENT"])
df.to_csv("burnfit_exercise_sample_with_images.csv", index=False, encoding="utf-8-sig", quotechar='"')
print("\n✅ CSV 저장 완료: burnfit_exercise_sample_with_images.csv")
