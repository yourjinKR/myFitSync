import pandas as pd

# CSV 파일 불러오기
pt_df = pd.read_csv("pt0730.csv")
burnfit_df = pd.read_csv("burnfit_exercise_sample_with_images.csv")

# 병합을 위한 딕셔너리 생성
image_dict = dict(zip(burnfit_df['PT_NAME'], burnfit_df['PT_IMAGE']))
content_dict = dict(zip(burnfit_df['PT_NAME'], burnfit_df['PT_CONTENT']))

# 1. 기존 pt 데이터에 이미지와 콘텐츠 병합
pt_df['PT_IMAGE'] = pt_df['PT_NAME'].map(image_dict)
pt_df['PT_CONTENT'] = pt_df['PT_NAME'].map(content_dict)

# 2. burnfit 데이터 중 pt_df에 없는 운동만 추출
pt_names_set = set(pt_df['PT_NAME'])
burnfit_new = burnfit_df[~burnfit_df['PT_NAME'].isin(pt_names_set)].copy()

# 3. 새로운 운동 항목에 PT_IDX 순차 부여
max_idx = pt_df['PT_IDX'].max()
burnfit_new['PT_IDX'] = range(max_idx + 1, max_idx + 1 + len(burnfit_new))

# 4. 누락된 컬럼 채워주기 (PT_WRITER, PT_HIDDEN 등)
burnfit_new['PT_WRITER'] = None
burnfit_new['PT_HIDDEN'] = 0

# 5. 컬럼 순서 맞춰 병합
burnfit_new = burnfit_new[['PT_IDX', 'PT_NAME', 'PT_CATEGORY', 'PT_IMAGE', 'PT_CONTENT', 'PT_WRITER', 'PT_HIDDEN']]
pt_df = pt_df[['PT_IDX', 'PT_NAME', 'PT_CATEGORY', 'PT_IMAGE', 'PT_CONTENT', 'PT_WRITER', 'PT_HIDDEN']]

# 6. 최종 병합 및 정렬
merged_df = pd.concat([pt_df, burnfit_new], ignore_index=True).sort_values(by='PT_IDX').reset_index(drop=True)

# 7. 저장
merged_df.to_csv("final_merged_pt_data.csv", index=False, encoding="utf-8-sig")
print("✅ 병합 완료: final_merged_pt_data.csv")
