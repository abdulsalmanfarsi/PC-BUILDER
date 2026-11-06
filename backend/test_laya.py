import laya

agent = laya.load("convaiinnovations/laya")

tests = [
    {
        "name": "Out of stock",
        "state": {
            "product": "RTX 4060 Ti 8GB",
            "price": 39750,
            "availability": "OUT OF STOCK",
            "required_vram": 16,
            "actual_vram": 8
        },
        "question": "Is this product currently available to purchase?"
    },
    {
        "name": "In stock",
        "state": {
            "product": "RTX 4060 Ti 8GB",
            "price": 39750,
            "availability": "IN STOCK",
            "required_vram": 8,
            "actual_vram": 8
        },
        "question": "Is this product currently available to purchase?"
    },
    {
        "name": "Insufficient VRAM",
        "state": {
            "product": "RTX 4060 Ti 8GB",
            "required_vram": 16,
            "actual_vram": 8
        },
        "question": "Does this GPU meet the requirement of at least 16GB VRAM?"
    },
    {
        "name": "Sufficient VRAM",
        "state": {
            "product": "RX 7800 XT 16GB",
            "required_vram": 16,
            "actual_vram": 16
        },
        "question": "Does this GPU meet the requirement of at least 16GB VRAM?"
    },
    {
        "name": "Over budget",
        "state": {
            "price": 50000,
            "budget": 40000
        },
        "question": "Is this product within the user's budget?"
    },
    {
        "name": "Within budget",
        "state": {
            "price": 35000,
            "budget": 40000
        },
        "question": "Is this product within the user's budget?"
    }
]

for test in tests:
    questions = {
        "decision": {
            "type": "noul",
            "instructions": test["question"]
        }
    }

    result = agent.predict(test["state"], questions)

    answer = result["answers"]["decision"]

    print("\n" + "=" * 60)
    print(test["name"])
    print("=" * 60)
    print("Expected:", "YES/NO based on the state")
    print("Result:", answer)