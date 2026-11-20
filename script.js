document.addEventListener("DOMContentLoaded", () => {
  const scene1 = document.getElementById("scene1");
  const scene2 = document.getElementById("scene2");
  const fadeOverlay = document.getElementById("fadeOverlay");

  const staffImg = document.getElementById("staffImg");
  const speechBubble = document.getElementById("speechBubble");
  const dialogueText = document.getElementById("dialogueText");
  const choiceContainer = document.getElementById("choiceContainer");
  const scene3 = document.getElementById("scene3");
  const s3Dog = document.getElementById("s3Dog");
  const s3Staff = document.getElementById("s3Staff");
  const s3Hand = document.getElementById("s3Hand");
  const receipt = document.getElementById("receipt");
  const receiptScroll = document.getElementById("receiptScroll");
  const receiptContent = document.getElementById("receiptContent");

  const typingSpeed = 30; // 글자 타이핑 속도 (ms)

  // 다음 말/질문이 나오기 전 쉬는 시간 (ms) — 더 느리게 하고 싶으면 숫자를 키우세요
  const PAUSE = {
    afterPick: 500, // 버튼 누른 뒤 → 직원 반응 시작 전
    afterResponse: 1800, // 직원 반응이 끝난 뒤 → 다음 질문 시작 전
    afterResponseSameQ: 1100, // 반응 끝에 이미 질문이 포함된 경우 → 버튼이 뜨기 전
    beforeQuestion: 900, // 반응 없이 바로 다음 질문으로 갈 때 (예: "네." 다음)
    afterRestart: 2000, // "싫어요" 반응 뒤 → 처음 질문으로 돌아가기 전
  };

  /* ============================================================
     대화 데이터 (분기 명세서 그대로)
     - text      : 직원이 하는 말
     - choices   : 손님 선택지 (label = 버튼 글자, response = 선택 후 직원 반응, next = 다음 노드)
     - emotion   : 직원 표정 (stand / an / smile / think), 생략하면 an
     - type      : "action"   = 직원 반응 후 자동 이동 (다시 시작)
                   "result"   = 최종 견종 → 3번째 씬(영수증)으로 이동
     ============================================================ */
  const yesNo = (text, result) => ({
    text,
    choices: [
      { label: "완벽해요!", next: result },
      { label: "싫어요.", next: "RESTART" },
    ],
  });

  const NODES = {
    /* 1. 시작 */
    START: {
      text: "안녕하세요!\n반려를 찾고 계시다고요?",
      emotion: "stand",
      choices: [{ label: "네.", next: "SIZE" }],
    },

    SIZE: {
      text: "좋아요... 덩치는 어느 정도가 적당하세요?",
      choices: [
        {
          label: "소형견이요.",
          response: "작으면 지켜주고 싶어지죠. 다리 길이는요?",
          next: "SMALL_LEGS",
        },
        {
          label: "중형견이요.",
          response: "껴안을 맛이 난다니까요. 다리 길이는요?",
          next: "MEDIUM_LEGS",
        },
        {
          label: "대형견이요.",
          response: "동거비 내야 되는 우리 친구들. 귀는요? 쫑긋쫑긋한 거요.",
          next: "LARGE_EARS",
        },
      ],
    },

    /* 2. 소형견 */
    SMALL_LEGS: {
      text: "다리 길이는요?",
      choices: [
        {
          label: "좀 짧은 게 좋아요.",
          response: "무슨 느낌인지 정확히 알아요.",
          next: "SMALL_SHORT_EARS",
        },
        {
          label: "적당히...?",
          response: "원래 적당한 게 최고거든요.",
          next: "ITALIAN_WALK",
        },
        {
          label: "긴 거요!",
          response: "모델을 찾으시는군요!",
          next: "ITALIAN_WALK",
        },
      ],
    },

    SMALL_SHORT_EARS: {
      text: "귀는요? 쫑긋쫑긋한 거요.",
      choices: [
        {
          label: "작고 동글동글.",
          response: "완벽히 이해했어요.",
          next: "POMERANIAN_QUESTION",
        },
        {
          label: "좀 크면 좋겠는데.",
          response: "얼마큼? 이 정도요? 오케이.",
          next: "SMALL_BIG_EARS_LEGS",
        },
        { label: "엄청 크게!", response: "와우우.", next: "CAVALIER_QUESTION" },
      ],
    },

    SMALL_BIG_EARS_LEGS: {
      text: "다리 길이는요?",
      choices: [
        {
          label: "적당히.",
          response: "원래 적당한 게 최고거든요.",
          next: "FRENCH_BULLDOG_QUESTION",
        },
        { label: "짧은 게 좋아요.", next: "DACHSHUND_QUESTION" },
      ],
    },

    // 이탈리안 그레이하운드 루트에만 들어가는 추가 질문 (결과에 영향 없음)
    ITALIAN_WALK: {
      text: "아, 하나만 더요. 산책할 땐 어떤 스타일이세요?",
      choices: [
        {
          label: "느긋하게 천천히.",
          response: "여유로운 산책, 좋죠.",
          next: "ITALIAN_GREYHOUND_QUESTION",
        },
        {
          label: "신나게 뛰어다니는 거요!",
          response: "에너지 넘치시네요. 잘 맞겠어요.",
          next: "ITALIAN_GREYHOUND_QUESTION",
        },
      ],
    },

    POMERANIAN_QUESTION: yesNo(
      "후 불면 날아갈 거 같은 털복숭이 어때요?",
      "POMERANIAN_RESULT",
    ),
    FRENCH_BULLDOG_QUESTION: yesNo(
      "주둥이가 아주 짧은 건 어떠세요?",
      "FRENCH_BULLDOG_RESULT",
    ),
    DACHSHUND_QUESTION: yesNo(
      "핫도그같이 생긴 개는 어떠세요?",
      "DACHSHUND_RESULT",
    ),
    CAVALIER_QUESTION: yesNo(
      "꼬리가 크고 풍성한 스타일 어떠세요?",
      "CAVALIER_RESULT",
    ),
    ITALIAN_GREYHOUND_QUESTION: yesNo(
      "옷핏이 좋은 애가 있거든요.",
      "ITALIAN_GREYHOUND_RESULT",
    ),

    /* 3. 중형견 */
    MEDIUM_LEGS: {
      text: "다리 길이는요?",
      choices: [
        {
          label: "좀 짧은 게 좋아요.",
          response: "무슨 느낌인지 정확히 알아요.",
          next: "MEDIUM_EARS",
        },
        {
          label: "적당히...?",
          response: "원래 적당한 게 최고거든요.",
          next: "MEDIUM_EARS",
        },
      ],
    },

    MEDIUM_EARS: {
      text: "귀는요? 쫑긋쫑긋한 거요.",
      choices: [
        {
          label: "위로 쫑긋하게!",
          response: "귓병도 잘 안 걸려서 좋죠. 주둥이 길이는요?",
          next: "MEDIUM_MUZZLE",
        },
        {
          label: "아래로 처진 게 좋은데!",
          response: "펄럭펄럭거리면 귀엽죠.",
          next: "MEDIUM_DROOPY_EARS",
        },
      ],
    },

    MEDIUM_MUZZLE: {
      text: "주둥이 길이는요?",
      choices: [
        {
          label: "평범하게!",
          response: "아주 풍성한 꼬리가 매력적인 애가 있죠.",
          next: "WELSH_CORGI_QUESTION",
        },
        {
          label: "납작하게!",
          response: "얘는 꼬리까지 납작해요.",
          next: "MEDIUM_FLAT_QUESTION",
        },
      ],
    },

    // 중형견 + 납작한 주둥이: 이미 주둥이 얘기를 했으니 질문을 다시 반복하지 않음
    MEDIUM_FLAT_QUESTION: yesNo(
      "그럼 이 친구 어떠세요?",
      "FRENCH_BULLDOG_RESULT",
    ),
    WELSH_CORGI_QUESTION: yesNo(
      "아주 풍성한 꼬리가 매력적인 애가 있죠.",
      "WELSH_CORGI_RESULT",
    ),
    MEDIUM_DROOPY_EARS: yesNo(
      "핫도그같이 생긴 개는 어떠세요?",
      "DACHSHUND_RESULT",
    ),

    /* 4. 대형견 */
    LARGE_EARS: {
      text: "귀는요? 쫑긋쫑긋한 거요.",
      choices: [
        {
          label: "위로 쫑긋하게!",
          response: "귓병도 잘 안 걸려서 좋죠.",
          next: "LARGE_EAR_STYLE",
        },
        {
          label: "아래로 처진 게 좋은데!",
          response: "펄럭펄럭거리면 귀엽죠.",
          next: "LARGE_EAR_STYLE",
        },
      ],
    },

    LARGE_EAR_STYLE: {
      text: "어느 스타일이 좋으세요?",
      choices: [
        {
          label: "주인을 지키는 충실한 개!",
          response: "손님도 분명 지켜줄 거예요.",
          next: "GERMAN_SHEPHERD_QUESTION",
        },
        {
          label: "좀 바보여도 귀엽기만 하면...",
          response: "얘는 도둑까지 환영한다는데.",
          next: "GOLDEN_RETRIEVER_QUESTION",
        },
      ],
    },

    GERMAN_SHEPHERD_QUESTION: yesNo(
      "경찰견으로 유명한 친구 어떠세요?",
      "GERMAN_SHEPHERD_RESULT",
    ),
    GOLDEN_RETRIEVER_QUESTION: yesNo(
      "챱츄. 이거 유행이에요.",
      "GOLDEN_RETRIEVER_RESULT",
    ),

    /* 5. 최종 견종 결과 (img = images/ 폴더의 강아지 이미지) */
    POMERANIAN_RESULT: {
      type: "result",
      breed: "포메라니안",
      img: "dog_pome.png",
    },
    FRENCH_BULLDOG_RESULT: {
      type: "result",
      breed: "프렌치 불독",
      img: "dog_buldog.png",
    },
    DACHSHUND_RESULT: {
      type: "result",
      breed: "닥스훈트",
      img: "dog_hotdog.png",
    },
    CAVALIER_RESULT: {
      type: "result",
      breed: "카발리에 킹 찰스",
      img: "dog_pri.png",
    },
    ITALIAN_GREYHOUND_RESULT: {
      type: "result",
      breed: "이탈리안 그레이하운드",
      img: "dog_gilda.png",
    },
    WELSH_CORGI_RESULT: {
      type: "result",
      breed: "웰시코기",
      img: "dog_wellsi.png",
    },
    GERMAN_SHEPHERD_RESULT: {
      type: "result",
      breed: "저먼 셰퍼드",
      img: "dog_sepod.png",
    },
    GOLDEN_RETRIEVER_RESULT: {
      type: "result",
      breed: "골든 리트리버",
      img: "dog_lite.png",
    },

    /* 6. 다시 시작 */
    RESTART: {
      type: "action",
      response:
        "이렇게 취향 까다로운 손님은 또 처음 보네. 처음부터 다시 해보죠.",
      next: "SIZE",
    },
  };

  /* ============================================================
     버튼 테두리 그리기 (디자인 button.svg 의 거친 테두리를 글자 길이에 맞춰 늘림)
     - 디자인의 테두리는 작은 질감 조각 260개로 이루어져 있어요
     - 버튼이 길어지면 가운데 직선 부분의 조각을 복사해서 채우고, 짧아지면 덜어내요
     - 조각: [x, y, 크기, 회전, 중심x, 중심y]
     ============================================================ */
  const BTN_W = 225.719; // 디자인 버튼 이미지 크기
  const BTN_H = 82.2027;
  const STRAIGHT_A = 70; // 위/아래 직선 구간 (이 구간을 늘리고 줄임)
  const STRAIGHT_B = 150;
  const STAMPS = [
    [33.645, 8.642, 0.02144, -100.316, 36.3, 5.17],
    [32.926, 3.561, 0.0269, -31.601, 38.19, 5.09],
    [43.807, 8.213, 0.02317, 170.911, 40.12, 5.26],
    [46.899, 7.634, 0.02653, 158.122, 42.03, 5.27],
    [39.771, 0.968, 0.02955, -4.78, 44.18, 5.08],
    [47.794, 9.626, 0.02302, -158.74, 46.12, 5.24],
    [45.264, 0.211, 0.02779, 11.696, 48.14, 5.09],
    [48.065, 10.105, 0.02599, -115.665, 50.06, 5.2],
    [58.855, 5.48, 0.03166, 134.047, 52.4, 5.27],
    [54.054, 0.155, 0.0245, 36.482, 54.55, 5.13],
    [57.627, 1.131, 0.02083, 60.632, 56.28, 5.16],
    [51.988, 3.461, 0.03133, -33.14, 58.17, 5.08],
    [59.592, 10.301, 0.02516, -130.118, 60.28, 5.22],
    [66.814, 9.02, 0.02844, 172.418, 62.39, 5.28],
    [70.441, 6.913, 0.02957, 147.956, 64.64, 5.28],
    [66.776, -1.235, 0.03118, 40.087, 67.01, 5.12],
    [71.643, 0.893, 0.02437, 72.668, 69.13, 5.18],
    [72.037, -0.653, 0.02873, 50.872, 71.16, 5.14],
    [70.916, -0.982, 0.03226, 19.535, 73.45, 5.09],
    [71.017, 4.023, 0.02236, -34.042, 75.44, 5.11],
    [73.084, 6.785, 0.02114, -70.246, 77.07, 5.14],
    [79.891, -1.081, 0.03066, 48.58, 79.2, 5.13],
    [80.945, 9.863, 0.02278, -136.224, 81.07, 5.22],
    [77.08, 4.85, 0.02943, -45.483, 83.08, 5.09],
    [81.644, 0.707, 0.02813, 1.965, 85.35, 5.09],
    [89.978, 1.411, 0.02259, 77.253, 87.33, 5.18],
    [86.186, 9.9, 0.02708, -106.487, 89.05, 5.18],
    [87.555, 10.549, 0.0321, -102.965, 91.29, 5.18],
    [99.532, 5.858, 0.02847, 138.058, 93.76, 5.27],
    [92.904, -0.275, 0.03037, 12.18, 96.0, 5.09],
    [92.449, 7.28, 0.03001, -68.483, 98.17, 5.12],
    [105.706, 7.777, 0.02836, 157.837, 100.49, 5.28],
    [101.325, 11.482, 0.03141, -125.783, 102.66, 5.22],
    [100.579, 8.37, 0.02633, -84.671, 104.87, 5.15],
    [107.847, 0.315, 0.0241, 52.64, 106.96, 5.15],
    [103.939, 5.115, 0.02302, -47.822, 108.63, 5.11],
    [115.317, 4.635, 0.02375, 125.015, 110.51, 5.24],
    [114.051, -0.748, 0.02977, 56.085, 112.6, 5.15],
    [108.84, 3.03, 0.03082, -28.793, 114.78, 5.08],
    [116.785, 11.487, 0.0307, -135.26, 117.06, 5.23],
    [117.714, 10.429, 0.0267, -121.386, 119.25, 5.21],
    [119.371, 10.011, 0.02532, -116.597, 121.24, 5.2],
    [129.75, 5.561, 0.03064, 134.875, 123.51, 5.27],
    [119.871, 4.607, 0.02851, -43.003, 125.66, 5.09],
    [128.349, 11.533, 0.03093, -141.965, 127.89, 5.24],
    [127.602, 10.695, 0.02981, -112.611, 130.19, 5.19],
    [137.662, 7.536, 0.02766, 155.865, 132.5, 5.27],
    [130.18, 7.691, 0.02408, -79.049, 134.38, 5.14],
    [132.16, 1.29, 0.02811, -6.347, 136.46, 5.08],
    [133.582, 7.519, 0.02657, -73.921, 138.45, 5.13],
    [146.757, 2.522, 0.0319, 107.529, 140.85, 5.24],
    [144.782, 0.456, 0.02469, 63.018, 142.99, 5.16],
    [141.103, 7.617, 0.02091, -83.106, 144.58, 5.15],
    [145.49, 9.531, 0.02148, -128.521, 146.19, 5.21],
    [147.366, 10.82, 0.02767, -130.813, 148.05, 5.22],
    [150.394, -1.443, 0.03218, 41.206, 150.51, 5.12],
    [148.126, 4.48, 0.02131, -39.42, 152.43, 5.11],
    [149.17, 9.116, 0.03218, -85.069, 154.39, 5.14],
    [159.26, 0.221, 0.027, 68.248, 156.84, 5.17],
    [152.845, 3.827, 0.03031, -36.078, 158.9, 5.08],
    [158.525, 10.597, 0.02938, -112.24, 161.11, 5.19],
    [159.86, 8.772, 0.02398, -95.316, 163.16, 5.17],
    [164.834, 0.753, 0.02152, 39.56, 165.04, 5.14],
    [173.653, 5.121, 0.03221, 130.9, 167.09, 5.27],
    [168.236, 11.343, 0.03049, -127.776, 169.32, 5.22],
    [175.701, 5.776, 0.02118, 139.272, 171.42, 5.25],
    [175.03, 0.976, 0.02258, 66.617, 173.13, 5.17],
    [178.841, 2.118, 0.02447, 93.963, 174.92, 5.21],
    [171.706, 5.253, 0.02427, -49.444, 176.65, 5.11],
    [182.296, 9.533, 0.02752, -178.345, 178.65, 5.27],
    [184.443, -0.076, 0.03081, 75.413, 181.0, 5.18],
    [184.486, 0.388, 0.02437, 58.631, 183.08, 5.16],
    [185.216, -1.037, 0.03021, 42.65, 185.17, 5.12],
    [186.061, 10.655, 0.02725, -126.143, 187.18, 5.21],
    [194.834, 3.043, 0.02841, 109.975, 189.47, 5.24],
    [194.971, 9.147, 0.02554, 179.326, 191.43, 5.33],
    [198.154, 4.347, 0.02402, 118.862, 193.39, 5.48],
    [196.641, 10.224, 0.02325, -157.257, 195.06, 5.76],
    [200.341, 9.117, 0.02268, 172.49, 196.81, 6.13],
    [193.522, 2.856, 0.03147, -13.364, 198.82, 6.48],
    [204.22, 2.242, 0.02936, 73.585, 201.1, 7.35],
    [200.175, 3.123, 0.0284, 12.234, 203.07, 8.14],
    [205.089, 4.598, 0.02193, 45.942, 204.8, 9.06],
    [211.296, 13.129, 0.02816, 163.339, 206.38, 10.16],
    [203.563, 7.229, 0.03006, -7.348, 208.23, 11.2],
    [203.694, 12.689, 0.03083, -48.116, 209.98, 12.65],
    [211.008, 20.614, 0.03079, -131.648, 211.68, 14.37],
    [217.326, 14.471, 0.02124, 114.326, 213.2, 15.8],
    [211.78, 21.05, 0.0229, -107.105, 214.16, 17.04],
    [220.35, 17.104, 0.02519, 115.917, 215.42, 18.54],
    [212.32, 17.272, 0.02397, -14.487, 216.4, 19.96],
    [221.116, 25.402, 0.0257, 176.352, 217.36, 21.75],
    [221.956, 25.803, 0.02196, 165.375, 218.21, 23.35],
    [224.571, 24.545, 0.02728, 126.855, 219.03, 25.06],
    [224.334, 31.233, 0.03022, 173.766, 219.72, 27.15],
    [215.707, 31.729, 0.02593, -78.174, 220.27, 29.05],
    [219.155, 36.797, 0.02871, -122.368, 220.71, 31.16],
    [219.816, 39.204, 0.02935, -125.876, 221.05, 33.35],
    [215.629, 38.143, 0.03041, -72.76, 221.25, 35.53],
    [226.233, 34.755, 0.02785, 99.297, 221.47, 37.84],
    [214.842, 41.139, 0.03216, -57.721, 221.3, 40.01],
    [222.564, 36.776, 0.02781, 53.366, 221.47, 42.34],
    [219.762, 39.616, 0.02436, 22.61, 221.43, 44.3],
    [218.948, 40.988, 0.02873, 17.377, 221.41, 46.3],
    [219.139, 43.601, 0.02564, 18.264, 221.26, 48.38],
    [215.557, 51.63, 0.02683, -61.078, 220.88, 50.37],
    [216.256, 49.852, 0.02422, -18.586, 220.57, 52.26],
    [215.135, 55.742, 0.02529, -66.156, 220.03, 54.12],
    [224.199, 54.814, 0.02335, 117.927, 219.58, 55.99],
    [219.063, 63.688, 0.02873, -141.143, 218.72, 57.84],
    [214.785, 55.633, 0.02472, 3.113, 217.96, 59.55],
    [221.169, 66.209, 0.03088, 179.427, 216.89, 61.59],
    [210.515, 62.77, 0.02561, -42.855, 215.72, 63.22],
    [208.674, 63.299, 0.02952, -32.455, 214.48, 64.89],
    [207.98, 70.382, 0.03031, -84.463, 212.94, 66.69],
    [216.494, 65.523, 0.02785, 102.278, 211.57, 68.36],
    [209.947, 74.63, 0.02425, -137.865, 209.94, 69.69],
    [214.194, 70.509, 0.02796, 127.751, 208.51, 70.95],
    [204.255, 67.505, 0.02521, 12.176, 206.83, 71.95],
    [204.508, 67.466, 0.02737, 35.629, 205.15, 73.01],
    [201.788, 68.827, 0.02622, 25.519, 203.32, 73.95],
    [204.744, 78.059, 0.02217, 177.533, 201.57, 74.85],
    [204.263, 76.81, 0.02179, 150.166, 200.04, 75.44],
    [192.817, 76.8, 0.02676, -57.663, 198.19, 75.86],
    [201.73, 73.676, 0.03033, 104.894, 196.24, 76.51],
    [197.968, 73.964, 0.02325, 94.63, 194.21, 76.85],
    [194.402, 73.088, 0.0214, 67.757, 192.52, 77.02],
    [190.348, 82.179, 0.02449, -134.545, 190.63, 77.19],
    [188.495, 81.466, 0.02096, -132.263, 188.91, 77.21],
    [187.672, 72.04, 0.02507, 46.473, 187.29, 77.14],
    [189.43, 81.08, 0.02798, 174.049, 185.18, 77.28],
    [177.794, 73.808, 0.03006, -15.579, 182.98, 77.07],
    [179.019, 71.698, 0.02796, 23.684, 180.83, 77.1],
    [177.92, 71.814, 0.02635, 33.126, 178.77, 77.12],
    [174.406, 72.302, 0.02619, 16.225, 176.75, 77.1],
    [179.22, 79.113, 0.0234, 155.072, 174.82, 77.26],
    [174.87, 82.923, 0.02969, -158.545, 172.72, 77.26],
    [168.508, 72.661, 0.02445, 15.298, 170.76, 77.11],
    [164.768, 75.258, 0.02232, -23.867, 168.93, 77.1],
    [172.091, 80.256, 0.02897, 162.481, 166.99, 77.28],
    [160.703, 77.326, 0.02124, -50.515, 165.03, 77.12],
    [162.928, 72.082, 0.02484, 37.058, 163.38, 77.13],
    [155.887, 74.897, 0.02847, -25.676, 161.27, 77.08],
    [163.902, 73.977, 0.0279, 97.514, 159.23, 77.22],
    [159.553, 80.897, 0.02122, -170.222, 157.23, 77.25],
    [159.389, 79.533, 0.02153, 163.487, 155.64, 77.25],
    [147.36, 79.344, 0.03205, -67.749, 153.5, 77.11],
    [152.003, 70.743, 0.03153, 48.787, 151.27, 77.13],
    [151.495, 80.805, 0.02093, -171.277, 149.14, 77.25],
    [144.01, 79.53, 0.02077, -81.964, 147.51, 77.15],
    [146.422, 72.171, 0.02449, 47.862, 145.93, 77.14],
    [140.094, 81.765, 0.02873, -99.452, 143.73, 77.17],
    [138.375, 80.351, 0.02289, -90.906, 141.78, 77.16],
    [137.179, 82.488, 0.02895, -111.595, 139.78, 77.19],
    [132.856, 77.619, 0.02437, -53.625, 137.8, 77.11],
    [133.637, 71.324, 0.03028, 21.401, 135.83, 77.09],
    [133.81, 72.903, 0.02078, 41.23, 133.88, 77.14],
    [134.835, 72.722, 0.02552, 73.324, 132.15, 77.18],
    [125.899, 80.925, 0.02717, -90.652, 129.96, 77.16],
    [121.288, 76.425, 0.03186, -41.993, 127.75, 77.08],
    [124.983, 71.446, 0.02798, 36.044, 125.6, 77.12],
    [117.64, 79.808, 0.03032, -73.513, 123.21, 77.12],
    [125.286, 81.261, 0.02857, 175.368, 121.04, 77.28],
    [118.868, 81.894, 0.02293, -135.884, 119.02, 77.22],
    [116.362, 83.358, 0.03022, -132.094, 116.97, 77.23],
    [112.954, 73.491, 0.02079, 10.957, 115.15, 77.11],
    [108.638, 76.695, 0.02343, -42.837, 113.4, 77.11],
    [109.399, 81.753, 0.02467, -112.86, 111.52, 77.19],
    [104.03, 79.634, 0.02933, -72.589, 109.46, 77.12],
    [106.375, 70.909, 0.03077, 33.418, 107.33, 77.11],
    [110.741, 74.236, 0.03193, 104.793, 104.96, 77.23],
    [105.127, 81.971, 0.02621, -165.936, 102.61, 77.26],
    [102.721, 73.322, 0.02082, 67.189, 100.93, 77.17],
    [97.198, 73.247, 0.02154, 13.926, 99.28, 77.11],
    [100.411, 72.802, 0.0257, 75.546, 97.53, 77.18],
    [97.159, 81.325, 0.02144, -158.645, 95.6, 77.24],
    [95.355, 72.708, 0.02276, 58.714, 94.04, 77.16],
    [89.812, 80.824, 0.02139, -104.505, 92.21, 77.18],
    [87.287, 81.43, 0.02583, -101.683, 90.39, 77.17],
    [87.512, 83.217, 0.02963, -130.544, 88.27, 77.22],
    [87.71, 72.618, 0.02312, 57.945, 86.43, 77.16],
    [83.595, 72.729, 0.0222, 28.329, 84.68, 77.12],
    [84.099, 73.023, 0.02091, 56.402, 83.05, 77.16],
    [86.543, 77.911, 0.02626, 139.182, 81.23, 77.26],
    [75.219, 75.457, 0.02178, -26.0, 79.34, 77.1],
    [82.762, 76.413, 0.02559, 123.038, 77.61, 77.25],
    [71.965, 72.47, 0.02857, 4.604, 75.52, 77.09],
    [75.595, 82.733, 0.02923, -161.187, 73.23, 77.26],
    [72.382, 71.853, 0.02656, 54.335, 71.24, 77.15],
    [73.748, 75.863, 0.02261, 114.979, 69.35, 77.23],
    [65.896, 81.438, 0.02224, -117.08, 67.5, 77.2],
    [68.027, 81.709, 0.02454, -164.859, 65.75, 77.25],
    [67.112, 73.091, 0.02528, 79.622, 63.98, 77.19],
    [65.05, 71.586, 0.03162, 72.135, 61.83, 77.17],
    [60.266, 72.132, 0.02475, 49.187, 59.65, 77.14],
    [53.891, 72.554, 0.02863, 3.115, 57.57, 77.08],
    [58.94, 73.067, 0.0262, 81.708, 55.54, 77.19],
    [50.244, 82.207, 0.02874, -106.819, 53.26, 77.18],
    [56.639, 77.935, 0.02641, 139.4, 51.3, 77.26],
    [46.894, 81.001, 0.02222, -105.305, 49.33, 77.18],
    [49.295, 71.576, 0.02864, 59.492, 47.56, 77.15],
    [49.102, 82.438, 0.03194, -175.479, 45.12, 77.28],
    [39.483, 80.666, 0.02413, -93.19, 42.94, 77.16],
    [41.265, 83.552, 0.03101, -141.719, 40.83, 77.24],
    [43.569, 77.713, 0.02304, 137.866, 38.89, 77.25],
    [31.345, 78.218, 0.0276, -59.139, 36.86, 77.11],
    [32.055, 72.381, 0.02684, 10.971, 34.89, 77.06],
    [37.867, 75.844, 0.02482, 118.42, 32.95, 77.05],
    [34.987, 74.141, 0.02276, 97.63, 31.17, 76.78],
    [23.61, 76.167, 0.02729, -46.464, 29.17, 76.3],
    [21.89, 76.167, 0.02611, -51.871, 27.2, 75.79],
    [23.965, 79.593, 0.02223, -118.921, 25.43, 75.3],
    [19.878, 78.099, 0.02552, -90.1, 23.73, 74.6],
    [17.299, 72.038, 0.02475, -28.209, 22.05, 73.73],
    [20.012, 79.194, 0.0311, -136.884, 20.11, 72.85],
    [22.11, 68.794, 0.02264, 92.76, 18.55, 71.73],
    [19.137, 75.256, 0.02465, -163.426, 16.96, 70.73],
    [18.076, 65.584, 0.02259, 73.501, 15.68, 69.52],
    [13.869, 74.027, 0.02825, -135.612, 14.09, 68.27],
    [12.795, 72.746, 0.02971, -140.101, 12.55, 66.69],
    [15.885, 65.271, 0.022, 133.159, 11.4, 65.2],
    [6.226, 61.205, 0.02341, -16.686, 10.31, 63.67],
    [7.193, 57.782, 0.02402, 16.082, 9.35, 62.18],
    [10.346, 65.416, 0.02516, -161.237, 8.3, 60.71],
    [3.14, 60.206, 0.02206, -63.497, 7.47, 58.99],
    [10.704, 60.466, 0.02397, 169.268, 6.8, 57.52],
    [-0.08, 56.819, 0.0306, -60.748, 6.0, 55.42],
    [7.093, 58.826, 0.02773, -155.493, 5.37, 53.44],
    [8.644, 56.283, 0.03055, -174.654, 4.91, 51.3],
    [7.21, 52.99, 0.02222, -172.942, 4.6, 49.29],
    [5.512, 42.325, 0.02525, 53.151, 4.54, 47.38],
    [8.372, 41.978, 0.02577, 90.246, 4.47, 45.49],
    [4.864, 37.633, 0.02818, 46.219, 4.46, 43.36],
    [0.317, 43.869, 0.02293, -79.238, 4.31, 41.43],
    [5.13, 32.91, 0.03166, 48.031, 4.48, 39.33],
    [9.532, 36.408, 0.02535, 122.561, 4.44, 37.28],
    [-0.019, 34.474, 0.02207, -36.785, 4.4, 35.33],
    [-0.092, 36.696, 0.02746, -82.762, 4.5, 33.49],
    [9.544, 28.033, 0.02799, 95.256, 4.98, 31.46],
    [10.775, 31.257, 0.02798, 150.777, 5.37, 29.44],
    [9.223, 21.94, 0.03016, 73.143, 6.06, 27.21],
    [2.36, 29.543, 0.03055, -94.223, 6.65, 25.03],
    [8.682, 17.415, 0.0277, 51.628, 7.76, 22.99],
    [3.042, 17.643, 0.03223, -18.048, 8.75, 20.9],
    [4.082, 20.937, 0.03043, -66.6, 9.96, 18.94],
    [15.919, 15.841, 0.02375, 113.521, 11.33, 17.39],
    [10.342, 20.393, 0.02385, -113.402, 12.35, 15.96],
    [14.358, 7.992, 0.03134, 45.668, 13.97, 14.37],
    [10.426, 11.018, 0.02632, -27.88, 15.47, 12.84],
    [12.287, 11.894, 0.02262, -50.284, 16.89, 11.69],
    [12.494, 9.408, 0.03008, -37.622, 18.53, 10.49],
    [25.382, 9.227, 0.02455, 128.487, 20.39, 9.55],
    [16.167, 7.03, 0.03002, -34.847, 22.13, 8.4],
    [25.168, 12.967, 0.02653, -149.547, 24.07, 7.67],
    [31.498, 8.249, 0.02729, 145.487, 26.08, 6.97],
    [24.13, 3.934, 0.0214, -15.556, 27.82, 6.26],
    [33.702, 0.783, 0.03121, 79.14, 29.88, 5.87],
    [34.481, 10.179, 0.02598, -167.256, 31.88, 5.57],
    [28.366, 5.599, 0.02706, -51.968, 33.87, 5.2],
    [31.259, 6.875, 0.02384, -68.77, 35.8, 5.13],
  ];
  let maskSeq = 0;

  function buildButtonBg(wd) {
    const d = wd - BTN_W; // 디자인 대비 가로 차이
    const span = STRAIGHT_B - STRAIGHT_A;
    const list = [];
    STAMPS.forEach((s) => {
      const cx = s[4];
      if (d < 0 && cx >= STRAIGHT_B + d && cx < STRAIGHT_B) return; // 짧아질 땐 덜어냄
      list.push(cx >= STRAIGHT_B ? [s[0] + d, s[1], s[2], s[3]] : s);
    });
    if (d > 0) {
      // 길어질 땐 직선 구간 조각을 복사해서 채움
      for (let k = 1; k <= Math.ceil(d / span); k++) {
        STAMPS.forEach((s) => {
          if (s[4] < STRAIGHT_A || s[4] >= STRAIGHT_B) return;
          const nx = s[4] + k * span;
          if (nx >= STRAIGHT_B && nx < STRAIGHT_B + d)
            list.push([s[0] + k * span, s[1], s[2], s[3]]);
        });
      }
    }
    const id = "btnMask" + ++maskSeq;
    const uses = list
      .map(
        (s) =>
          `<use href="#btnStamp" transform="translate(${s[0]} ${s[1]}) scale(${s[2]}) rotate(${s[3]})"/>`,
      )
      .join("");
    return (
      `<svg class="btn-bg" viewBox="0 0 ${wd} ${BTN_H}" preserveAspectRatio="none" aria-hidden="true">` +
      `<rect x="4.378" y="5.179" width="${217 + d}" height="72" rx="32" fill="#F4F4F4"/>` +
      `<mask id="${id}" fill="white" maskUnits="userSpaceOnUse" x="-20" y="-20" width="${wd + 40}" height="${BTN_H + 40}">${uses}</mask>` +
      `<rect class="btn-ring" x="0" y="0" width="${wd}" height="${BTN_H}" mask="url(#${id})"/>` +
      `</svg>`
    );
  }

  // 버튼 크기에 맞춰 테두리를 (다시) 그림. 크기가 바뀌면(글꼴 로딩, 창 크기 등) 자동으로 다시 그려요
  function decorateButton(btn) {
    let lastW = 0;
    const draw = () => {
      if (!btn.offsetHeight) return;
      const wd = (btn.offsetWidth / btn.offsetHeight) * BTN_H;
      if (Math.abs(wd - lastW) < 0.5) return;
      lastW = wd;
      const old = btn.querySelector(".btn-bg");
      if (old) old.remove();
      btn.insertAdjacentHTML("afterbegin", buildButtonBg(wd));
    };
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(btn);
  }

  /* ============================================================
     연출 도구
     ============================================================ */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 표정 이미지 미리 불러오기 (표정 바뀔 때 깜빡임 방지)
  ["stand", "an", "smile", "think"].forEach((k) => {
    const img = new Image();
    img.src = `images/1_h_${k}.png`;
  });

  // 3번째 씬 이미지도 미리 불러오기
  [
    "2_background.png",
    "3_receipt_logo.png",
    "1_h_stand.png",
    "ui/receipt_frame.png",
  ].forEach((f) => {
    const img = new Image();
    img.src = `images/${f}`;
  });

  // 직원 표정 바꾸기 (stand, an, smile, think)
  function setStaffEmotion(emotionKey) {
    if (staffImg) staffImg.src = `images/1_h_${emotionKey}.png`;
  }

  /* ============================================================
     대사 줄바꿈 자동 정리
     - 단어(띄어쓰기) 중간에서는 절대 끊지 않고, 문장이 끝나는 자리(. ? ! …)를 우선해서 줄을 나눠요
     - 두 줄이 균형 잡히게 나누고, 그래도 안 들어가면 글자를 조금씩 줄여요
     - 폰트가 바뀌어도 실제 글자 폭을 재서 계산하기 때문에 따로 손볼 필요가 없어요
     - 대사 안에 직접 넣은 \n 은 그대로 존중해요
     ============================================================ */
  const fontsReady = document.fonts
    ? document.fonts.load('700 20px "SOYO Maple"').catch(() => {})
    : Promise.resolve();
  const measureCtx = document.createElement("canvas").getContext("2d");
  const MAX_LINES_AT_FULL = 2; // 기본 크기에서는 2줄까지
  const SCALES_STRICT = [1, 0.96, 0.92, 0.9]; // 문장 끝에서 끊기 위해 줄여볼 수 있는 한도
  const SCALES_2LINE = [1, 0.96, 0.92, 0.88, 0.84, 0.8]; // 2줄에 안 들어가면 이 비율로 줄여봄
  const SCALES_3LINE = [0.9, 0.85, 0.8]; // 그래도 안 되면 3줄 (말풍선 높이 때문에 글자를 줄임)

  function measureText(str, px, cs) {
    measureCtx.font = `${cs.fontWeight} ${px}px ${cs.fontFamily}`;
    const ls = -0.03 * px; // CSS 의 letter-spacing: -0.03em 과 같게
    if ("letterSpacing" in measureCtx) {
      measureCtx.letterSpacing = `${ls}px`;
      return measureCtx.measureText(str).width;
    }
    return measureCtx.measureText(str).width + ls * str.length;
  }

  // 한 문단을 maxLines 줄 안에서 가장 자연스럽게 나눔 (안 되면 null)
  function breakParagraph(par, px, avail, maxLines, cs, strict) {
    const w = (s) => measureText(s, px, cs);
    if (w(par) <= avail) return [par];
    const words = par.split(" ");
    const n = words.length;
    const join = (a, b) => words.slice(a, b).join(" ");
    // strict: 문장이 끝나는 자리(. ? ! …)가 있으면 반드시 거기서만 끊음 (없으면 일반 규칙)
    const hasSentenceEnd = words.some((x, i) => i < n - 1 && /[.?!…]$/.test(x));
    const mustBreakAtSentence = strict && hasSentenceEnd;
    const score = (lines) => {
      if (
        mustBreakAtSentence &&
        lines.slice(0, -1).some((l) => !/[.?!…]$/.test(l))
      )
        return Infinity;
      const widths = lines.map(w);
      if (widths.some((x) => x > avail)) return Infinity;
      let s = Math.max(...widths);
      // 문장 끝(. ? ! …)에서 끊으면 보너스, 쉼표는 약한 보너스
      lines.slice(0, -1).forEach((l) => {
        if (/[.?!…]$/.test(l)) s -= 0.2 * avail;
        else if (/,$/.test(l)) s -= 0.08 * avail;
      });
      // 너무 짧은 줄(마지막 줄이 한두 글자 등)은 벌점
      widths.forEach((x) => {
        if (x < 0.22 * avail) s += 0.2 * avail;
      });
      return s;
    };
    let best = null;
    let bestScore = Infinity;
    for (let i = 1; i < n; i++) {
      const two = [join(0, i), join(i, n)];
      const s2 = score(two);
      if (s2 < bestScore) {
        best = two;
        bestScore = s2;
      }
      if (maxLines >= 3) {
        for (let j = i + 1; j < n; j++) {
          const three = [join(0, i), join(i, j), join(j, n)];
          const s3 = score(three);
          if (s3 < bestScore) {
            best = three;
            bestScore = s3;
          }
        }
      }
    }
    return best;
  }

  // 대사 전체를 정리해서 { text(줄바꿈 포함), scale } 로 돌려줌
  function layoutDialogue(text) {
    dialogueText.style.fontSize = "";
    const cs = getComputedStyle(dialogueText);
    const basePx = parseFloat(cs.fontSize);
    const avail =
      (dialogueText.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight)) *
      0.97;
    if (!(avail > 0) || !(basePx > 0)) return { text, scale: 1 };

    const pars = text.split("\n");
    const tryScales = (scales, maxTotal, strict) => {
      for (const scale of scales) {
        const px = basePx * scale;
        const out = [];
        let ok = true;
        for (let p = 0; p < pars.length; p++) {
          const room = maxTotal - out.length - (pars.length - 1 - p); // 이 문단에 쓸 수 있는 줄 수
          const lines = breakParagraph(
            pars[p],
            px,
            avail,
            Math.max(1, room),
            cs,
            strict,
          );
          if (!lines) {
            ok = false;
            break;
          }
          out.push(...lines);
          if (out.length > maxTotal) {
            ok = false;
            break;
          }
        }
        if (ok && out.length <= maxTotal)
          return { text: out.join("\n"), scale };
      }
      return null;
    };
    return (
      tryScales(SCALES_STRICT, MAX_LINES_AT_FULL, true) || // 1) 문장 끝에서 끊기 (글자를 아주 조금만 줄여서라도)
      tryScales(SCALES_2LINE, MAX_LINES_AT_FULL, false) || // 2) 안 되면 단어 단위로 균형 있게
      tryScales(SCALES_3LINE, 3, false) || { text, scale: 0.8 } // 3) 그래도 안 되면 3줄
    );
  }
  window.__layoutDialogue = layoutDialogue; // (확인용)

  // 한 글자씩 타이핑. 아직 안 쳐진 글자는 투명하게 자리만 잡아서 위치가 흔들리지 않아요.
  async function say(text, emotion = "an") {
    setStaffEmotion(emotion);
    speechBubble.classList.add("show");
    await fontsReady; // 폰트가 로딩된 뒤에 글자 폭을 재요
    const laid = layoutDialogue(text);
    text = laid.text;
    dialogueText.style.fontSize =
      laid.scale < 1 ? `${(2.1 * laid.scale).toFixed(3)}cqw` : "";
    dialogueText.innerHTML =
      '<span class="typed"></span><span class="rest"></span>';
    const typed = dialogueText.querySelector(".typed");
    const rest = dialogueText.querySelector(".rest");
    rest.textContent = text;

    return new Promise((resolve) => {
      let i = 0;
      (function step() {
        if (i >= text.length) return resolve();
        i++;
        typed.textContent = text.slice(0, i);
        rest.textContent = text.slice(i);
        setTimeout(step, typingSpeed);
      })();
    });
  }

  // 선택지 버튼 보여주기. 클릭하면 선택한 항목을 돌려줌
  function askChoices(choices) {
    return new Promise((resolve) => {
      choiceContainer.innerHTML = "";
      choices.forEach((c) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerHTML = '<span class="btn-label"></span>';
        btn.querySelector(".btn-label").textContent = c.label;
        btn.addEventListener("click", async () => {
          choiceContainer
            .querySelectorAll("button")
            .forEach((b) => (b.disabled = true));
          btn.classList.add("is-picked"); // 누른 버튼은 '클릭' 디자인으로
          await hideChoices();
          resolve(c);
        });
        choiceContainer.appendChild(btn);
      });
      choiceContainer.querySelectorAll(".choice-btn").forEach(decorateButton);
      requestAnimationFrame(() => choiceContainer.classList.add("show"));
    });
  }

  async function hideChoices() {
    choiceContainer.classList.remove("show");
    await sleep(300);
  }

  /* ============================================================
     SCENE 3 : 영수증 확인 → 결제
     ============================================================ */

  // 견종별 강아지 이미지 위치 (카발리에를 디자인 시안에 맞춘 값: 크기 1.71배, 가운데 x 359.5, 바닥 y 567.6)
  // bbox = 이미지 안에서 강아지가 실제로 차지하는 영역 [x0, y0, x1, y1]
  const DOG_SCALE = 1.71;
  const DOG_CENTER_X = 359.5;
  const DOG_GROUND_Y = 567.6;
  const DOG_BBOX = {
    "dog_pri.png": { size: [324, 250], bbox: [33, 31, 288, 198] },
    "dog_buldog.png": { size: [324, 250], bbox: [60, 27, 263, 216] },
    "dog_gilda.png": { size: [342, 250], bbox: [39, 18, 298, 243] },
    "dog_hotdog.png": { size: [324, 250], bbox: [25, 0, 290, 201] },
    "dog_lite.png": { size: [342, 250], bbox: [4, 13, 334, 234] },
    "dog_pome.png": { size: [324, 250], bbox: [49, 32, 245, 213] },
    "dog_sepod.png": { size: [342, 250], bbox: [14, 0, 322, 250] },
    "dog_wellsi.png": { size: [342, 250], bbox: [33, 21, 308, 225] },
  };

  /* ---- 영수증 내용 ----
     name      : 견종 이름 / life : 수명
     items[]   : 질환 (name 질환명 / rate 발병 확률 / symptom 주요 증상 / desc 설명 문단(줄 배열, 생략 가능)
                         / cost 예상 치료 비용 / note 치료 내용 설명(생략 가능, 비용 아래 작게 표시))
     ※ 카발리에는 디자인 시안 그대로, 나머지 견종은 전달받은 문서 내용 그대로 넣었어요. */
  const RECEIPTS = {
    CAVALIER_RESULT: {
      name: "카발리에 킹 찰스 스패니얼",
      life: "9년 ~ 14년",
      items: [
        {
          name: "이첨판 폐쇄부전증 (심장병 / MVD)",
          rate: "100%",
          symptom: "청색증, 만성 기침, 심부전",
          desc: [
            "카발리에는 유전적으로 이첨판이 변형되기 쉬워",
            "혈액이 역류하는 심장병에 취약하다.",
            "심하면 폐부종과 심부전이 발생하지만,",
            "조기 발견과 관리로 안정적으로 지낼 수 있다.",
          ],
          cost: "24,000,000원",
        },
        {
          name: "척수공동증 (SM)",
          rate: "70%",
          symptom: "머리 통증, 허공 긁기",
          desc: [
            "척수 내부에 액체가 찬 공간이 생겨",
            "신경을 압박하는 질환이다.",
            "카발리에 견종의 유전적 요인이 크며,",
            "통증·목 긁기·보행 이상을 유발할 수 있다.",
          ],
          cost: "6,000,000원",
        },
      ],
    },
    FRENCH_BULLDOG_RESULT: {
      name: "프렌치 불독",
      life: "10년 ~ 12년",
      items: [
        {
          name: "단두종 호흡기 증후군 (BAS)",
          rate: "85% 이상 (고위험)",
          symptom: "만성 호흡곤란, 체온조절 불가, 수면무호흡, 수명 2~3년 감소",
          cost: "3,500,000원",
          note: "비강 확장 및 연구개 절제 수술 + 산소치료",
        },
        {
          name: "반척추증 및 척추 기형",
          rate: "50%",
          symptom: "뒷다리 마비, 신경통, 보행 장애",
          cost: "4,500,000원",
          note: "척추 MRI 검사 + 교정 수술 및 재활",
        },
        {
          name: "만성 피부 접힘 염증 및 알레르기",
          rate: "60%",
          symptom: "피부 궤양, 만성 가려움, 평생 약물 복용",
          cost: "18,000,000원",
          note: "월 15만 원 / 10년 기준",
        },
      ],
    },
    DACHSHUND_RESULT: {
      name: "닥스훈트",
      life: "12년 ~ 16년",
      items: [
        {
          name: "추간판 탈출증 (척추 디스크 / IVDD)",
          rate: "25% ~ 40% (고위험)",
          symptom: "극심한 통증, 하반신 마비, 배변 장애, 보행 불가",
          cost: "5,000,000원",
          note: "척추 MRI 검사 + 디스크 감압 수술",
        },
        {
          name: "진행성 망막 위축증 (PRA)",
          rate: "15%",
          symptom: "야맹증으로 시작하여 완치 없이 성견 시 완전 실명",
          cost: "1,500,000원",
          note: "보조제 및 지속적인 안과 정밀 검사",
        },
      ],
    },
    WELSH_CORGI_RESULT: {
      name: "웰시코기",
      life: "12년 ~ 15년",
      items: [
        {
          name: "퇴행성 척수증 (DM)",
          rate: "15% ~ 20%",
          symptom: "뒷다리부터 시작되는 전신 마비, 발병 후 1~2년 내 사망",
          cost: "3,000,000원",
          note: "재활 치료, 보조 휠체어 제작, 통증 관리",
        },
        {
          name: "고관절 이형성증 (CHD)",
          rate: "30%",
          symptom: "관절 탈구, 토끼 뛰기 걸음걸이, 만성 관절통",
          cost: "4,000,000원",
          note: "양측 관절 수술 및 약물 치료",
        },
      ],
    },
    GOLDEN_RETRIEVER_RESULT: {
      name: "골든 리트리버",
      life: "10년 ~ 12년",
      items: [
        {
          name: "고관절 이형성증 및 관절염",
          rate: "50% 이상",
          symptom: "기립 불능, 만성 통증, 활동성 급감, 수명 1~2년 감소",
          cost: "8,000,000원",
          note: "인공 고관절 치환 수술",
        },
        {
          name: "혈관육종 및 악성 종양 (암)",
          rate: "60% (견종 사망 원인 1위)",
          symptom: "장기 출혈, 급사, 기대 수명 3~5년 단축",
          cost: "7,000,000원",
          note: "종양 적출 수술 + 항암치료",
        },
      ],
    },
    POMERANIAN_RESULT: {
      name: "포메라니안",
      life: "12년 ~ 16년",
      items: [
        {
          name: "슬개골 탈구",
          rate: "70% 이상",
          symptom: "다리 절뚝거림, 퇴행성 관절염, 파행",
          cost: "2,500,000원",
          note: "양쪽 뒷다리 슬개골 교정 수술",
        },
        {
          name: "기관 허탈 (기관지 협착증)",
          rate: "40%",
          symptom: "거위 울음 소리의 기침, 호흡 곤란, 흥분 시 거품 토함",
          cost: "4,000,000원",
          note: "기관 스텐트 삽입 수술 및 약물 케어",
        },
      ],
    },
    GERMAN_SHEPHERD_RESULT: {
      name: "저먼 셰퍼드",
      life: "9년 ~ 13년",
      items: [
        {
          name: "위확장-꼬임 (위염전 / GDV)",
          rate: "20%",
          symptom: "위가 뒤틀려 쇼크 발생, 발병 후 수 시간 내 사망 위험",
          cost: "3,500,000원",
          note: "응급 위 고정 수술",
        },
        {
          name: "주관절 및 고관절 이형성증",
          rate: "45%",
          symptom: "다리 변형, 만성 절뚝거림, 이동 불가",
          cost: "6,000,000원",
          note: "관절 고정 및 성형 수술",
        },
      ],
    },
    ITALIAN_GREYHOUND_RESULT: {
      name: "이탈리안 그레이하운드",
      life: "12년 ~ 15년",
      items: [
        {
          name: "요척골(앞다리) 골절",
          rate: "50% 이상 (약한 뼈 구조)",
          symptom: "가벼운 점프에도 다리 뼈 부러짐, 재발률 매우 높음",
          cost: "3,500,000원",
          note: "핀 고정 수술 및 깁스 치료",
        },
        {
          name: "탈모증 및 색소 이상 (CDA)",
          rate: "30%",
          symptom: "전신 모공 염증, 영구적인 털 빠짐, 체온 유지 불가",
          cost: "2,000,000원",
          note: "약용 샴푸, 피부 보습 및 항생제 케어",
        },
      ],
    },
  };

  const RECEIPT_SERIAL = "0002-000982"; // 영수증 번호 (시간 뒤에 붙는 번호)
  const ARROW_SVG =
    '<svg class="r-arrow" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="#9a8d81"/>' +
    '<path d="M22 12.5v18M14 22.5l8 8 8-8" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const pad2 = (n) => String(n).padStart(2, "0");

  function receiptStamp() {
    const t = new Date();
    return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())} ${pad2(t.getHours())}:${pad2(t.getMinutes())}:${pad2(t.getSeconds())} ${RECEIPT_SERIAL}`;
  }

  function buildReceipt(id) {
    const r = RECEIPTS[id];
    const sections = r.items
      .map(
        (it) => `
      <section class="r-sec">
        <h3 class="r-sec-title">${esc(it.name)}</h3>
        <div class="r-row"><span class="r-label r-label-fixed">발병 확률</span><span class="r-dots"></span><span class="r-val">${esc(it.rate)}</span></div>
        <div class="r-row"><span class="r-label r-label-fixed">주요 증상</span><span class="r-dots"></span><span class="r-val">${esc(it.symptom)}</span></div>
        ${it.desc ? `<p class="r-desc">${it.desc.map(esc).join("<br>")}</p>` : ""}
        <div class="r-row r-cost"><span class="r-label">예상 치료 비용</span><span class="r-dots"></span><span class="r-val">${esc(it.cost)}</span></div>
        ${it.note ? `<p class="r-note">(${esc(it.note)})</p>` : ""}
      </section>`,
      )
      .join("");
    receiptContent.innerHTML = `
      <div class="r-header">
        <img class="r-logo" src="images/3_receipt_logo.png" alt="">
        <div class="r-brand">Paws &amp; Play</div>
        <div class="r-stamp">${receiptStamp()}</div>
      </div>
      <h2 class="r-title" id="rTitle">${esc(r.name)}</h2>
      <div class="r-life">수명 ${esc(r.life)}</div>
      <div class="r-cta" id="rCta">
        <button class="choice-btn cta-btn" id="btnBill"><span class="btn-label">청구된 금액 확인하기</span></button>
        ${ARROW_SVG}
      </div>
      ${sections}
      <div class="r-pay">
        <button class="choice-btn cta-btn" id="btnPay"><span class="btn-label">결제하기</span></button>
        ${ARROW_SVG}
      </div>`;
    receiptContent.querySelectorAll(".choice-btn").forEach(decorateButton);
  }

  // 한 줄에 안 들어가는 긴 제목은 글자를 조금 줄여서 맞춤
  function fitOneLine(el) {
    el.style.fontSize = "";
    const base = parseFloat(getComputedStyle(el).fontSize);
    let px = base;
    while (el.scrollWidth > el.clientWidth + 1 && px > base * 0.6) {
      px *= 0.96;
      el.style.fontSize = px + "px";
    }
  }

  function placeDog(file) {
    const d = DOG_BBOX[file];
    const [x0, y0, x1, y1] = d.bbox;
    const left = DOG_CENTER_X - ((x0 + x1) / 2) * DOG_SCALE;
    const top = DOG_GROUND_Y - y1 * DOG_SCALE;
    s3Dog.src = `images/${file}`;
    s3Dog.style.left = `${(left / 1474) * 100}%`;
    s3Dog.style.top = `${(top / 640) * 100}%`;
    s3Dog.style.width = `${((d.size[0] * DOG_SCALE) / 1474) * 100}%`;
  }

  // 손 이미지: 화면 전체 크기(가로로 긴 이미지)면 그대로, 잘라낸 이미지면 시안 위치(x 680)에 1:1로 놓음
  function setupHand() {
    const apply = () => {
      const cropped = s3Hand.naturalWidth / s3Hand.naturalHeight < 2;
      s3Hand.classList.toggle("is-cropped", cropped);
      if (cropped)
        s3Hand.style.width = `${(s3Hand.naturalWidth / 1474) * 100}%`;
    };
    if (s3Hand.complete && s3Hand.naturalWidth) apply();
    else s3Hand.addEventListener("load", apply, { once: true });
    s3Hand.addEventListener("error", () => s3Hand.remove(), { once: true }); // 손 이미지가 없으면 건너뜀
  }
  setupHand();

  const waitClick = (el) =>
    new Promise((resolve) =>
      el.addEventListener("click", resolve, { once: true }),
    );

  async function startScene3(id, node) {
    // 1) 암전 → 장면 교체
    fadeOverlay.classList.add("blackout");
    await sleep(800);
    scene2.classList.remove("active");
    scene3.classList.add("active");

    buildReceipt(id);
    placeDog(node.img);
    await fontsReady;
    fitOneLine(document.getElementById("rTitle"));

    fadeOverlay.classList.remove("blackout");
    await sleep(900);

    // 2) 강아지 등장 → 영수증이 아래에서 올라옴
    s3Dog.classList.add("show");
    await sleep(500);
    receipt.classList.add("is-in");
    await sleep(900);

    // 3) '청구된 금액 확인하기' → 영수증이 위로 올라가며 스크롤 가능해짐
    await waitClick(document.getElementById("btnBill"));
    const unit = receipt.getBoundingClientRect().width / 637.7; // 디자인 1px 이 화면에서 몇 px 인지
    document.getElementById("rCta").classList.add("is-gone");
    receipt.classList.remove("is-in");
    receipt.classList.add("is-up");
    receiptScroll.scrollTo({ top: 176 * unit * 0.9875, behavior: "smooth" });
    await sleep(700);
    receiptScroll.classList.add("is-unlocked");

    // 4) '결제하기' → 직원이 튀어나오고 손이 스윽 올라옴 → 페이드 아웃
    await waitClick(document.getElementById("btnPay"));
    receiptScroll.classList.remove("is-unlocked");
    receipt.classList.add("is-out");
    await sleep(500);
    s3Staff.classList.add("pop-up");
    await sleep(600);
    s3Hand.classList.add("show");
    await sleep(2200);
    fadeOverlay.classList.add("blackout");
    await sleep(900);

    // 다음 화면을 붙일 때 이 이벤트를 받으면 돼요
    document.dispatchEvent(
      new CustomEvent("paymentDone", { detail: { breed: node.breed, id } }),
    );
  }

  /* ============================================================
     대화 진행
     ============================================================ */
  async function go(id, skipText = false) {
    const node = NODES[id];

    // 다시 시작
    if (node.type === "action") {
      await say(node.response, "think");
      await sleep(PAUSE.afterRestart);
      return go(node.next);
    }

    // 최종 결과 → 3번째 씬 (영수증)
    if (node.type === "result") {
      return startScene3(id, node);
    }

    // 일반 질문
    if (!skipText) await say(node.text, node.emotion || "an");
    const picked = await askChoices(node.choices);

    await sleep(PAUSE.afterPick);

    if (picked.response) {
      await say(picked.response, "smile");
      const next = NODES[picked.next];
      // 반응 마지막 문장이 다음 질문과 같으면 (예: "...다리 길이는요?") 질문을 다시 치지 않고 버튼만 보여줌
      const repeated =
        next.text && picked.response.trim().endsWith(next.text.trim());
      await sleep(repeated ? PAUSE.afterResponseSameQ : PAUSE.afterResponse);
      return go(picked.next, repeated);
    }
    await sleep(PAUSE.beforeQuestion);
    return go(picked.next);
  }

  /* ============================================================
     Scene 1 -> Scene 2 전환 + Scene 2 시작
     ============================================================ */
  function startScene2() {
    setStaffEmotion("stand");
    staffImg.classList.add("pop-up"); // 직원이 아래에서 뿅 올라옴

    // 직원이 등판 완료된 후(0.65초 뒤) 대화 시작
    setTimeout(() => go("START"), 650);
  }

  function initFlow() {
    // 7초 후: 줌인이 가게 문 앞까지 도달했을 때 암전(Fade Out)
    setTimeout(() => fadeOverlay.classList.add("blackout"), 7000);

    // 7.8초 후: Scene 1 끄고 Scene 2로 교체 후 페이드 인
    setTimeout(() => {
      scene1.classList.remove("active");
      scene2.classList.add("active");
      fadeOverlay.classList.remove("blackout");
      startScene2();
    }, 7800);
  }

  initFlow();
});
