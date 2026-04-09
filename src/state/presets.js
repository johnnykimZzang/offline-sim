// ─────────────────────────────────────────────────────────────────────────────
// Presets — partial state로 저장. 도메인 일부 필드만 덮어쓴다.
//
// 사용: dispatch(actions.applyPreset(presets.conservative.state))
// ─────────────────────────────────────────────────────────────────────────────

export const presets = {
  conservative: {
    id: "conservative",
    label: "보수",
    description: "유입·전환·재구매 모두 보수적으로",
    color: "#898989",
    state: {
      demand: {
        footTraffic: 1800,
        storeEntryRate: 3,
        weekendWeight: 120,
        touristRatio: 10,
      },
      conversion: {
        purposeVisitRatio: 60,
        baseConvRate: 12,
        purposeConvRate: 22,
        companionRatio: 50,
        companionDecisionRate: 40,
      },
      fitting: {
        useRate: 12,
        purchaseRate: 35,
        waitDropRate: 15,
      },
      crm: {
        signupRate: 18,
        optInRate: 75,
        storyUploadRate: 25,
        onlineRepurchaseRate: 8,
      },
      product: {
        setPurchaseRate: 25,
        addonPurchaseRate: 12,
      },
    },
  },

  realistic: {
    id: "realistic",
    label: "현실",
    description: "일반적인 한남동 매장 기준",
    color: "#3ecf8e",
    state: {
      demand: {
        footTraffic: 2500,
        storeEntryRate: 5,
        weekendWeight: 140,
        touristRatio: 15,
      },
      conversion: {
        purposeVisitRatio: 80,
        baseConvRate: 20,
        purposeConvRate: 35,
        companionRatio: 60,
        companionDecisionRate: 50,
      },
      fitting: {
        useRate: 20,
        purchaseRate: 50,
        waitDropRate: 10,
      },
      crm: {
        signupRate: 30,
        optInRate: 90,
        storyUploadRate: 45,
        onlineRepurchaseRate: 18,
      },
      product: {
        setPurchaseRate: 40,
        addonPurchaseRate: 20,
      },
    },
  },

  optimistic: {
    id: "optimistic",
    label: "낙관",
    description: "브랜드 인지 확보 + 입소문 가정",
    color: "#a78bfa",
    state: {
      demand: {
        footTraffic: 3500,
        storeEntryRate: 8,
        weekendWeight: 170,
        touristRatio: 20,
      },
      conversion: {
        purposeVisitRatio: 90,
        baseConvRate: 28,
        purposeConvRate: 50,
        companionRatio: 65,
        companionDecisionRate: 55,
      },
      fitting: {
        useRate: 30,
        purchaseRate: 65,
        waitDropRate: 8,
      },
      crm: {
        signupRate: 45,
        optInRate: 95,
        storyUploadRate: 60,
        onlineRepurchaseRate: 28,
      },
      product: {
        setPurchaseRate: 50,
        addonPurchaseRate: 30,
      },
    },
  },

  target: {
    id: "target",
    label: "목표 (1억)",
    description: "월 1억 달성에 필요한 최소 조건",
    color: "#f5a623",
    state: {
      demand: {
        footTraffic: 2800,
        storeEntryRate: 6,
        weekendWeight: 150,
        touristRatio: 15,
      },
      conversion: {
        purposeVisitRatio: 80,
        baseConvRate: 22,
        purposeConvRate: 40,
        companionRatio: 60,
        companionDecisionRate: 55,
      },
      fitting: {
        useRate: 25,
        purchaseRate: 55,
        waitDropRate: 10,
      },
      crm: {
        signupRate: 35,
        optInRate: 90,
        storyUploadRate: 50,
        onlineRepurchaseRate: 20,
      },
      product: {
        setPurchaseRate: 45,
        addonPurchaseRate: 25,
      },
    },
  },
};

export const presetList = [
  presets.conservative,
  presets.realistic,
  presets.optimistic,
  presets.target,
];
