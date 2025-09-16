import pandas as pd
import numpy as np # numpy 추가

print("🚀 데이터 변환 작업을 시작합니다.")

# ==============================================================================
# 1. 기존 데이터 로드 및 병합 (제공해주신 코드 기반)
# ==============================================================================
try:
    pt_df = pd.read_csv("pt0730.csv")
    burnfit_df = pd.read_csv("burnfit_exercise_sample_with_images.csv")
except FileNotFoundError as e:
    print(f"❌ 파일 로드 오류: {e}. 'pt0730.csv'와 'burnfit_exercise_sample_with_images.csv' 파일이 스크립트와 동일한 위치에 있는지 확인해주세요.")
    exit()

# 병합을 위한 딕셔너리 생성
image_dict = dict(zip(burnfit_df['PT_NAME'], burnfit_df['PT_IMAGE']))
content_dict = dict(zip(burnfit_df['PT_NAME'], burnfit_df['PT_CONTENT']))

# 기존 pt 데이터에 이미지와 콘텐츠 병합
pt_df['PT_IMAGE'] = pt_df['PT_NAME'].map(image_dict)
pt_df['PT_CONTENT'] = pt_df['PT_NAME'].map(content_dict)

# burnfit 데이터 중 pt_df에 없는 운동만 추출
pt_names_set = set(pt_df['PT_NAME'])
burnfit_new = burnfit_df[~burnfit_df['PT_NAME'].isin(pt_names_set)].copy()

# 새로운 운동 항목에 PT_IDX 순차 부여
max_idx = pt_df['PT_IDX'].max()
burnfit_new['PT_IDX'] = range(max_idx + 1, max_idx + 1 + len(burnfit_new))

# 누락된 컬럼 채우기
burnfit_new['PT_WRITER'] = None
burnfit_new['PT_HIDDEN'] = 0

# 컬럼 순서 맞춰 병합
burnfit_new = burnfit_new[['PT_IDX', 'PT_NAME', 'PT_CATEGORY', 'PT_IMAGE', 'PT_CONTENT', 'PT_WRITER', 'PT_HIDDEN']]
pt_df = pt_df[['PT_IDX', 'PT_NAME', 'PT_CATEGORY', 'PT_IMAGE', 'PT_CONTENT', 'PT_WRITER', 'PT_HIDDEN']]

# 최종 병합 및 정렬
merged_df = pd.concat([pt_df, burnfit_new], ignore_index=True).sort_values(by='PT_IDX').reset_index(drop=True)
print("✅ 1단계: 기존 데이터 병합 완료.")

# ==============================================================================
# 2. `exercises.csv` 생성
# ==============================================================================
# 새로운 exercises 테이블 구조에 맞게 컬럼 선택 및 이름 변경
# PT_IDX -> id, PT_NAME -> name, PT_CATEGORY -> category
exercises_df = merged_df[['PT_IDX', 'PT_NAME', 'PT_CATEGORY']].copy()
exercises_df.rename(columns={
    'PT_IDX': 'id',
    'PT_NAME': 'name',
    'PT_CATEGORY': 'category'
}, inplace=True)

# 'description' 컬럼(요약 정보)은 현재 원본 데이터에 없으므로 빈 값으로 추가
exercises_df['description'] = None

# DB에서 자동 생성될 created_at, updated_at 컬럼은 CSV에 포함하지 않음
exercises_df.to_csv("exercises.csv", index=False, encoding="utf-8-sig")
print("✅ 2단계: `exercises.csv` 파일 생성 완료.")

# ==============================================================================
# 3. `exercise_instructions.csv` 생성
# ==============================================================================
instructions_list = []

# merged_df의 각 행을 순회하며 instruction 데이터 추출
for index, row in merged_df.iterrows():
    exercise_id = row['PT_IDX']
    content_str = row['PT_CONTENT']

    # PT_CONTENT가 비어있지 않은 경우에만 처리
    if pd.notna(content_str):
        # '|' 문자를 기준으로 설명을 단계별로 분리
        steps = content_str.split('|')
        
        # 각 단계를 순회하며 데이터 생성
        for i, step_description in enumerate(steps):
            # step_order는 1부터 시작
            step_order = i + 1
            
            # 공백 제거
            cleaned_description = step_description.strip()
            
            # 데이터가 있는 경우에만 추가
            if cleaned_description:
                instructions_list.append({
                    'exercise_id': exercise_id,
                    'step_order': step_order,
                    'description': cleaned_description
                })

# 리스트를 DataFrame으로 변환
instructions_df = pd.DataFrame(instructions_list)

# DB에서 자동 생성될 id, created_at 컬럼은 CSV에 포함하지 않음
instructions_df.to_csv("exercise_instructions.csv", index=False, encoding="utf-8-sig")
print("✅ 3단계: `exercise_instructions.csv` 파일 생성 완료.")
print("\n🎉 모든 작업이 완료되었습니다.")