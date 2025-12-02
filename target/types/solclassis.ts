/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solclassis.json`.
 */
export type Solclassis = {
  "address": "Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3",
  "metadata": {
    "name": "solclassis",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "docs": [
    "✅ Solclassis 프로그램"
  ],
  "instructions": [
    {
      "name": "createCampaign",
      "docs": [
        "✅ 캠페인 생성"
      ],
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "foundation"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        },
        {
          "name": "donationAmount",
          "type": "u64"
        },
        {
          "name": "endDate",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createDonationPda",
      "docs": [
        "✅ 후원자 PDA 생성"
      ],
      "discriminator": [
        75,
        162,
        138,
        220,
        179,
        79,
        69,
        197
      ],
      "accounts": [
        {
          "name": "donation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "donor"
              },
              {
                "kind": "account",
                "path": "campaign"
              }
            ]
          }
        },
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "donate",
      "docs": [
        "✅ 펀딩 참여"
      ],
      "discriminator": [
        121,
        186,
        218,
        211,
        73,
        70,
        196,
        180
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "donor",
          "writable": true,
          "signer": true,
          "relations": [
            "donation"
          ]
        },
        {
          "name": "donation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "donor"
              },
              {
                "kind": "account",
                "path": "campaign"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endCampaign",
      "docs": [
        "✅ 캠페인 종료 (Cloudflare Worker로 자동 호출 예정)"
      ],
      "discriminator": [
        6,
        152,
        36,
        161,
        147,
        29,
        30,
        90
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "getCampaignStatus",
      "docs": [
        "✅ 캠페인 상태 조회 (디버깅용)"
      ],
      "discriminator": [
        64,
        77,
        60,
        187,
        108,
        24,
        200,
        203
      ],
      "accounts": [
        {
          "name": "campaign"
        }
      ],
      "args": []
    },
    {
      "name": "refund",
      "docs": [
        "✅ 환불 (기부자가 직접 호출)"
      ],
      "discriminator": [
        2,
        96,
        183,
        251,
        63,
        208,
        46,
        46
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "donation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "donor"
              },
              {
                "kind": "account",
                "path": "campaign"
              }
            ]
          }
        },
        {
          "name": "donor",
          "writable": true,
          "signer": true,
          "relations": [
            "donation"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "docs": [
        "✅ 자금 인출 (재단 지갑으로 전송)"
      ],
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "foundation",
          "writable": true,
          "relations": [
            "campaign"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "donation",
      "discriminator": [
        189,
        210,
        54,
        77,
        216,
        85,
        7,
        68
      ]
    }
  ],
  "events": [
    {
      "name": "campaignCompleted",
      "discriminator": [
        114,
        100,
        117,
        191,
        22,
        109,
        23,
        132
      ]
    },
    {
      "name": "campaignCreated",
      "discriminator": [
        9,
        98,
        69,
        61,
        53,
        131,
        64,
        152
      ]
    },
    {
      "name": "campaignFailed",
      "discriminator": [
        50,
        192,
        118,
        12,
        197,
        171,
        198,
        177
      ]
    },
    {
      "name": "donationReceived",
      "discriminator": [
        160,
        135,
        32,
        7,
        241,
        105,
        91,
        158
      ]
    },
    {
      "name": "refundProcessed",
      "discriminator": [
        203,
        88,
        236,
        233,
        192,
        178,
        57,
        161
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "overflowError",
      "msg": "Overflow error occurred."
    },
    {
      "code": 6001,
      "name": "campaignEnded",
      "msg": "The campaign has already ended."
    },
    {
      "code": 6002,
      "name": "campaignNotComplete",
      "msg": "The campaign has not reached its goal."
    },
    {
      "code": 6003,
      "name": "noFundsAvailable",
      "msg": "No funds available for withdrawal or refund."
    },
    {
      "code": 6004,
      "name": "invalidDonationAmount",
      "msg": "Invalid donation amount."
    },
    {
      "code": 6005,
      "name": "descriptionTooLong",
      "msg": "Campaign description is too long."
    },
    {
      "code": 6006,
      "name": "withdrawAmountTooSmall",
      "msg": "Withdrawal amount is too small."
    },
    {
      "code": 6007,
      "name": "invalidGoalAmount",
      "msg": "Invalid goal amount."
    },
    {
      "code": 6008,
      "name": "alreadyDonated",
      "msg": "You have already donated to this campaign."
    },
    {
      "code": 6009,
      "name": "campaignNotFailed",
      "msg": "The campaign has not failed."
    },
    {
      "code": 6010,
      "name": "campaignNotEnded",
      "msg": "The campaign cannot be ended before its end date."
    },
    {
      "code": 6011,
      "name": "campaignAlreadyComplete",
      "msg": "The campaign is already complete or failed."
    }
  ],
  "types": [
    {
      "name": "campaign",
      "docs": [
        "✅ 데이터 구조체"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "foundation",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "donationAmount",
            "type": "u64"
          },
          {
            "name": "raised",
            "type": "u64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "failed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "campaignCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "raised",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "campaignCreated",
      "docs": [
        "✅ 이벤트 정의"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "goal",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "campaignFailed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "raised",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "donation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "donor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "donationReceived",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "donor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "refundProcessed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "campaign",
            "type": "pubkey"
          },
          {
            "name": "donor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
