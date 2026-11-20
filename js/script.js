/*
 * 12주차 인터랙티브반 공통 실습 시작 파일
 *
 * 현재 구현됨: 페이지 진입 애니메이션, 연도 A/B 데이터 전환.
 *
 * 연도 전환이 적용되는 부모: .compare-section#unemployment-compare-section
 * 선택 버튼: .year-button-a / .year-button-b
 * 변경 대상: .year-rate / .year-description / .year-chart
 */

// 기존에 정상 작동하는 화면 진입 효과. 기능 추가 시 유지한다.
document.documentElement.classList.add('has-js');
const revealSections = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealSections.forEach((section) => observer.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add('is-visible'));
}

const compareSection = document.querySelector('.compare-section#unemployment-compare-section');
if (!compareSection) {
  throw new Error('실업률 비교 섹션을 찾을 수 없습니다.');
}

const yearButtonA = compareSection.querySelector('.year-button-a');
const yearButtonB = compareSection.querySelector('.year-button-b');
const yearRate = compareSection.querySelector('.year-rate');
const yearLabel = compareSection.querySelector('.year-label');
const metricTitle = compareSection.querySelector('.metric-title');
const yearDescription = compareSection.querySelector('.year-description');
const yearChart = compareSection.querySelector('.year-chart');
const chartFooterLabel = compareSection.querySelector('.chart-footer span');
const chartStatus = compareSection.querySelector('.chart-status');
const practiceStatus = compareSection.querySelector('.practice-status');

if (
  !yearButtonA || !yearButtonB || !yearRate || !yearLabel || !metricTitle ||
  !yearDescription || !yearChart || !chartFooterLabel || !chartStatus || !practiceStatus
) {
  throw new Error('연도 비교에 필요한 요소를 찾을 수 없습니다.');
}

const yearData = {
  a: {
    rate: '4.2',
    label: 'YEAR A',
    title: '연도 A의 실업률 변화',
    description: '연도 A를 선택한 초기 화면입니다. 학습용 수치를 기반으로 그래프와 설명이 표시됩니다.',
    image: 'images/year-a.svg',
    imageAlt: '가상 데이터 연도 A 실업률 추이 그래프',
    chartStatus: '초기 그래프가 표시 중입니다.',
    practiceStatus: ' 현재는 연도 A의 가상 데이터가 표시 중입니다.'
  },
  b: {
    rate: '3.6',
    label: 'YEAR B',
    title: '연도 B의 실업률 변화',
    description: '연도 B를 선택한 화면입니다. 학습용 수치를 기반으로 그래프와 설명이 표시됩니다.',
    image: 'images/year-b.svg',
    imageAlt: '가상 데이터 연도 B 실업률 추이 그래프',
    chartStatus: '연도 B 그래프가 표시 중입니다.',
    practiceStatus: ' 현재는 연도 B의 가상 데이터가 표시 중입니다.'
  }
};

function selectYear(year, selectedButton) {
  const data = yearData[year];
  yearRate.firstChild.nodeValue = data.rate;
  yearLabel.textContent = data.label;
  metricTitle.textContent = data.title;
  yearDescription.textContent = data.description;
  yearChart.src = data.image;
  yearChart.alt = data.imageAlt;
  yearChart.classList.remove('is-animating');
  void yearChart.offsetWidth;
  yearChart.classList.add('is-animating');
  chartFooterLabel.textContent = `연도 ${year.toUpperCase()}`;
  chartStatus.textContent = data.chartStatus;
  practiceStatus.lastChild.nodeValue = data.practiceStatus;

  [yearButtonA, yearButtonB].forEach((button) => {
    const isSelected = button === selectedButton;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

yearButtonA.addEventListener('click', () => selectYear('a', yearButtonA));
yearButtonB.addEventListener('click', () => selectYear('b', yearButtonB));
selectYear('a', yearButtonA);
