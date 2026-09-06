import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models.database import User, Case, GraphNode, GraphEdge, Alert, LinkFeedback
from app.services.explainability.justification import generate_link_justification

def seed_database():
    init_db()
    db: Session = SessionLocal()
    
    try:
        # ════════════════════════════════════════════════════════════════
        # 1. SEED USERS (Investigator, Analyst, Admin)
        # ════════════════════════════════════════════════════════════════
        if db.query(User).count() == 0:
            users_to_seed = [
                User(
                    email="admin@netra.gov.in",
                    hashed_password=get_password_hash("Netra@2026"),
                    full_name="SP Rajesh Kumar",
                    role="admin",
                    badge_number="NCRB-DL-001",
                    is_active=True
                ),
                User(
                    email="investigator@netra.gov.in",
                    hashed_password=get_password_hash("Netra@2026"),
                    full_name="Inspector Ananya Sen",
                    role="investigator",
                    badge_number="WSD-DL-412",
                    is_active=True
                ),
                User(
                    email="analyst@netra.gov.in",
                    hashed_password=get_password_hash("Netra@2026"),
                    full_name="Sub-Inspector Rohan Verma",
                    role="analyst",
                    badge_number="INT-MHA-889",
                    is_active=True
                )
            ]
            db.add_all(users_to_seed)
            db.commit()
            print("[+] Seeded 3 Default NETRA Users (admin, investigator, analyst)")

        # ════════════════════════════════════════════════════════════════
        # 2. SEED 10 CASES WITH FULL DETAILS
        # ════════════════════════════════════════════════════════════════
        cases_data = [
            {
                "id": "CASE-26189",
                "title": "Operation Maya — Interstate Cyber Syndicate & Women Safety Extortion",
                "fir_number": "FIR-492/2026-NCRB-MHA",
                "description": "Cross-state organized syndicate operating illicit loan app extortions, synthetic digital arrest rings, and hawala money movement targeting female executives across Delhi, Gurugram, Mewat, and Mumbai. Primary targets include women professionals subjected to morphed image blackmail via malicious loan APKs.",
                "status": "ACTIVE",
                "created_by": "Inspector Ananya Sen"
            },
            {
                "id": "CASE-26190",
                "title": "Project Chakravyuh — Mewat Cyber Fraud & SIM Cloning Grid",
                "fir_number": "FIR-108/2026-CYBER",
                "description": "Mewat-based coordinated mule-account network and bulk VoIP spoofing operations. The gang clones SIM cards at scale, uses AI-generated voice deepfakes to impersonate police officers, and runs a 24/7 calling center targeting elderly women across Tier-2 cities.",
                "status": "UNDER_INVESTIGATION",
                "created_by": "Inspector Ananya Sen"
            },
            {
                "id": "CASE-26191",
                "title": "Operation Saffron — Cryptocurrency Laundering & Dark Web Markets",
                "fir_number": "FIR-217/2026-SFIO",
                "description": "Multi-state cryptocurrency laundering ring converting extortion proceeds through privacy coins (Monero, Zcash) and peer-to-peer crypto exchanges. Linked to dark web marketplace 'BazaarX' selling stolen Aadhaar-PAN datasets and compromised bank credentials targeting women-owned small businesses.",
                "status": "ACTIVE",
                "created_by": "SP Rajesh Kumar"
            },
            {
                "id": "CASE-26192",
                "title": "Operation Trident — Cross-State Human Trafficking Network",
                "fir_number": "FIR-331/2026-WSD-MHA",
                "description": "Organized trafficking network operating across Bihar, Jharkhand, and Delhi NCR. Victims, primarily young women aged 16-25, are lured through fake domestic help agencies. Network uses coded WhatsApp groups, burner phones, and a chain of safe houses for transit. Direct nexus with PS 26189 Women Safety mandate.",
                "status": "CRITICAL",
                "created_by": "Inspector Ananya Sen"
            },
            {
                "id": "CASE-26193",
                "title": "Operation Garuda — Cross-Border Drug & Arms Syndicate",
                "fir_number": "FIR-445/2026-NCB",
                "description": "Punjab-Rajasthan border drug trafficking corridor linked to cross-border narcotics pipeline. Syndicate uses modified commercial vehicles with hidden compartments, hawala channels for payment, and encrypted Telegram channels for coordination. Connected to arms smuggling via Thar desert route.",
                "status": "ACTIVE",
                "created_by": "SP Rajesh Kumar"
            },
            {
                "id": "CASE-26194",
                "title": "Operation Shield — Identity Theft & Aadhaar Fraud Ring",
                "fir_number": "FIR-189/2026-UIDAI",
                "description": "Nationwide identity fraud operation exploiting compromised UIDAI enrollment centers to generate fake Aadhaar-linked bank accounts. Targets women beneficiaries of government welfare schemes. Proceeds laundered through a network of shell micro-finance companies operating in rural UP and MP.",
                "status": "UNDER_INVESTIGATION",
                "created_by": "Sub-Inspector Rohan Verma"
            },
            {
                "id": "CASE-26195",
                "title": "Operation Thunderbolt — Organized Extortion & Protection Racket",
                "fir_number": "FIR-556/2026-EOW",
                "description": "Extortion syndicate targeting women entrepreneurs and small business owners in Mumbai-Pune corridor. Uses deepfake video calls impersonating CBI/ED officers, fabricated arrest warrants, and coordinated social media harassment campaigns. Linked to real estate mafia and political nexus.",
                "status": "ACTIVE",
                "created_by": "Inspector Ananya Sen"
            },
            {
                "id": "CASE-26196",
                "title": "Operation Neptune — Maritime Smuggling & Port Corruption",
                "fir_number": "FIR-672/2026-DRI",
                "description": "Organized smuggling network operating through Mumbai, Kandla, and Mundra ports. Imports counterfeit electronics and pharmaceuticals through mislabeled shipping containers. Customs officials on payroll. Financial trail connects to hawala operators in Dubai and Hong Kong.",
                "status": "UNDER_INVESTIGATION",
                "created_by": "SP Rajesh Kumar"
            },
            {
                "id": "CASE-26197",
                "title": "Operation Falcon — Political Corruption & Black Money Trail",
                "fir_number": "FIR-801/2026-ED",
                "description": "Multi-crore disproportionate assets case involving a network of shell companies, benami properties, and offshore accounts. Funds traced through layered corporate structures in Delhi, Kolkata, and Singapore. Key beneficiary linked to infrastructure contract manipulation.",
                "status": "ACTIVE",
                "created_by": "SP Rajesh Kumar"
            },
            {
                "id": "CASE-26198",
                "title": "Operation Viper — Cyberstalking & Digital Harassment Network",
                "fir_number": "FIR-923/2026-CC-WSD",
                "description": "Coordinated cyberstalking network targeting women journalists, activists, and public figures. Uses AI-generated deepfake content, doxxing tools, and coordinated bot armies for harassment campaigns. Infrastructure traced to compromised cloud servers and Telegram bot networks. Direct Women Safety Division priority.",
                "status": "CRITICAL",
                "created_by": "Inspector Ananya Sen"
            }
        ]

        for cd in cases_data:
            if not db.query(Case).filter(Case.id == cd["id"]).first():
                db.add(Case(
                    id=cd["id"],
                    title=cd["title"],
                    fir_number=cd["fir_number"],
                    description=cd["description"],
                    status=cd["status"],
                    created_by=cd["created_by"],
                    created_at=datetime.utcnow() - timedelta(days=len(cases_data) - cases_data.index(cd))
                ))
        db.commit()
        print(f"[+] Seeded {len(cases_data)} Investigative Cases")

        # ════════════════════════════════════════════════════════════════
        # 3. SEED GRAPH NODES — CASE-26189 (Operation Maya)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26189").count() == 0:
            nodes_26189 = [
                # --- Cluster 1: Hawala & Money Movement ---
                {"node_id": "suspect_sanjay", "label": "Sanjay Singhal", "entity_type": "PERSON",
                 "aliases": ["Sethji", "SS Hawala"], "phone": "+919811029384", "vehicle_plate": "DL01CA9988",
                 "latitude": 28.5355, "longitude": 77.2410,
                 "properties": {"role": "Hawala Mastermind", "risk_score": 94, "call_count": 84, "txn_volume_inr": 45000000}},
                {"node_id": "org_apex_fin", "label": "Apex Bullion & Forex Ltd", "entity_type": "ORGANIZATION",
                 "aliases": ["Apex Shell Co"], "phone": "+911145982100",
                 "latitude": 28.6328, "longitude": 77.2197,
                 "properties": {"role": "Front Shell Entity", "risk_score": 88}},
                {"node_id": "suspect_priya_m", "label": "Priya Mehra", "entity_type": "PERSON",
                 "aliases": ["Accountant Priya"], "phone": "+919871092834",
                 "latitude": 28.5700, "longitude": 77.3200,
                 "properties": {"role": "Mule Account Bookkeeper", "risk_score": 72}},
                {"node_id": "phone_sanjay_burner", "label": "+919811029384 (Primary Hawala Line)", "entity_type": "PHONE",
                 "phone": "+919811029384", "latitude": 28.5355, "longitude": 77.2410,
                 "properties": {"role": "Burner SIM (Fake Aadhaar)", "provider": "Airtel"}},
                # --- Bridge Node 1 ---
                {"node_id": "suspect_vikram_bridge", "label": "Vikram Malhotra (Key Broker)", "entity_type": "PERSON",
                 "aliases": ["Agent Vicky", "The Fixer"], "phone": "+919910238475", "vehicle_plate": "HR26DQ1122",
                 "latitude": 28.4595, "longitude": 77.0266,
                 "properties": {"role": "Key Inter-Gang Broker (Bridge)", "risk_score": 98, "call_count": 195, "txn_volume_inr": 18000000}},
                # --- Cluster 2: Cyber Extortion Hub ---
                {"node_id": "suspect_rahul_cyber", "label": "Rahul 'Cyber' Sharma", "entity_type": "PERSON",
                 "aliases": ["Operator Rocky", "Ghost Admin"], "phone": "+919810847291",
                 "latitude": 27.9944, "longitude": 77.0460,
                 "properties": {"role": "Call Center Team Lead", "risk_score": 91, "call_count": 120}},
                {"node_id": "suspect_devender_anomaly", "label": "Devender @ Lala (High CDR Anomaly)", "entity_type": "PERSON",
                 "aliases": ["Lala SIM Dispenser"], "phone": "+919711823901", "vehicle_plate": "HR55AB4490",
                 "latitude": 28.1200, "longitude": 76.9800,
                 "properties": {"role": "Bulk SIM Provider", "risk_score": 95, "anomalous": True, "call_count": 412, "night_call_ratio": 0.88, "tower_locations_count": 9}},
                {"node_id": "org_quick_loan_app", "label": "Bharat Rupee Loan Platform (Fake)", "entity_type": "ORGANIZATION",
                 "aliases": ["QuickPay Loan APK"], "latitude": 28.4700, "longitude": 77.0800,
                 "properties": {"role": "Malicious Loan App Infrastructure", "risk_score": 96}},
                {"node_id": "loc_safehouse_mewat", "label": "Nuh Safehouse Call Facility", "entity_type": "LOCATION",
                 "latitude": 27.9944, "longitude": 77.0460,
                 "properties": {"role": "VoIP Center Facility", "risk_score": 85}},
                {"node_id": "phone_cyber_burner1", "label": "+919810847291 (Extortion VoIP SIM)", "entity_type": "PHONE",
                 "phone": "+919810847291", "latitude": 27.9944, "longitude": 77.0460,
                 "properties": {"role": "VoIP SIM Gateway"}},
                # --- Bridge Node 2 ---
                {"node_id": "suspect_karan_bridge2", "label": "Karan Oberoi", "entity_type": "PERSON",
                 "aliases": ["KO Transport"], "phone": "+919818374619", "vehicle_plate": "DL08CB7711",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Cash Transport & Mule Dispatcher", "risk_score": 82, "call_count": 89}},
                # --- Cluster 3: Logistics ---
                {"node_id": "suspect_imran_logistics", "label": "Imran @ Shooter", "entity_type": "PERSON",
                 "aliases": ["Imran Bhai", "Logistics Chief"], "phone": "+919999128374", "vehicle_plate": "UP16AX3344",
                 "latitude": 28.4089, "longitude": 77.3178,
                 "properties": {"role": "Field Enforcer & Logistics", "risk_score": 89, "call_count": 76}},
                {"node_id": "vehicle_fortuner_black", "label": "Toyota Fortuner (Black) — DL01CA9988", "entity_type": "VEHICLE",
                 "vehicle_plate": "DL01CA9988", "latitude": 28.5355, "longitude": 77.2410,
                 "properties": {"role": "Getaway & Cash Courier Vehicle"}},
                {"node_id": "vehicle_scorpio_white", "label": "Mahindra Scorpio — UP16AX3344", "entity_type": "VEHICLE",
                 "vehicle_plate": "UP16AX3344", "latitude": 28.4089, "longitude": 77.3178,
                 "properties": {"role": "Mule Transport Vehicle"}},
                {"node_id": "suspect_tariq_driver", "label": "Tariq Mansoor", "entity_type": "PERSON",
                 "aliases": ["Driver Tariq"], "phone": "+919873461092",
                 "latitude": 28.4200, "longitude": 77.3000,
                 "properties": {"role": "Courier Driver", "risk_score": 64}},
                {"node_id": "loc_warehousing_noida", "label": "Sector 63 Safehouse Warehouse", "entity_type": "LOCATION",
                 "latitude": 28.6189, "longitude": 77.3810,
                 "properties": {"role": "Equipment Cache & Drop Point"}},
                {"node_id": "suspect_amit_mule", "label": "Amit Kasana", "entity_type": "PERSON",
                 "phone": "+919810112233", "latitude": 28.4700, "longitude": 77.5000,
                 "properties": {"role": "Bank Account Holder (Mule)", "risk_score": 58}},
                {"node_id": "suspect_neha_recruiter", "label": "Neha Chawla", "entity_type": "PERSON",
                 "phone": "+919818889900", "latitude": 28.4500, "longitude": 77.0200,
                 "properties": {"role": "Telecaller Recruiter", "risk_score": 67}},
                {"node_id": "phone_neha_line", "label": "+919818889900 (Recruiter Line)", "entity_type": "PHONE",
                 "phone": "+919818889900", "latitude": 28.4500, "longitude": 77.0200,
                 "properties": {"role": "Calling SIM"}},
                {"node_id": "loc_call_hub_gurgaon", "label": "Udyog Vihar Cyber Office", "entity_type": "LOCATION",
                 "latitude": 28.5020, "longitude": 77.0860,
                 "properties": {"role": "Commercial Office Front"}}
            ]
            _seed_nodes(db, "CASE-26189", nodes_26189)

        # ════════════════════════════════════════════════════════════════
        # 4. SEED EDGES — CASE-26189
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26189").count() == 0:
            edges_26189 = [
                ("edge_1", "suspect_sanjay", "org_apex_fin", "DIRECTOR_OF", "Corporate Registry", "Sanjay Singhal is registered beneficial director of shell entity Apex Bullion & Forex Ltd.", 0.96, "confirm"),
                ("edge_2", "suspect_sanjay", "phone_sanjay_burner", "SUBSCRIBER_OF", "CAF / Telecom KYC", "CAF records establish Sanjay Singhal as active subscriber of primary hawala line.", 0.94, "confirm"),
                ("edge_3", "suspect_sanjay", "suspect_priya_m", "TRANSFERRED_FUNDS", "Bank Subpoena", "Over 45 structured RTGS transfers totaling ₹1.8 Cr routed to Priya Mehra.", 0.91, "confirm"),
                ("edge_4", "suspect_sanjay", "vehicle_fortuner_black", "REGISTERED_OWNER", "Vahan National Register", "Vehicle registration DL01CA9988 linked directly to Sanjay Singhal.", 0.99, "confirm"),
                ("edge_5", "suspect_vikram_bridge", "suspect_sanjay", "COMMUNICATED_WITH", "CDR Intercept", "32 encrypted calls and 14 SMS records exchanged during money laundering window.", 0.88, "confirm"),
                ("edge_6", "suspect_vikram_bridge", "suspect_rahul_cyber", "COORDINATED_WITH", "Signal & CDR Logs", "Vikram Malhotra coordinates victim payout distribution directly with Rahul Sharma.", 0.89, "confirm"),
                ("edge_7", "suspect_vikram_bridge", "suspect_karan_bridge2", "ESCROW_HANDSHAKE", "Banking & Surveillance", "Frequent physical handovers at Cyber Hub parking monitored by task force.", 0.82, "confirm"),
                ("edge_8", "suspect_rahul_cyber", "org_quick_loan_app", "OPERATES_INFRA", "Server Forensic Logs", "Admin access to Bharat Rupee Loan APK backend traced to Rahul Sharma's IP.", 0.93, "confirm"),
                ("edge_9", "suspect_rahul_cyber", "loc_safehouse_mewat", "GEOLOCATED_AT", "Tower CDR Dumps", "Continuous cell tower presence at Nuh safehouse location during extortion shifts.", 0.86, "confirm"),
                ("edge_10", "suspect_rahul_cyber", "phone_cyber_burner1", "USED_DEVICE", "IMEI Matching", "IMEI 867192039401928 used concurrently for extortion SIM.", 0.95, "confirm"),
                ("edge_11", "suspect_rahul_cyber", "suspect_devender_anomaly", "PURCHASED_SIMS", "Confession / CDR", "Devender supplied 150+ pre-activated SIM cards to Rahul's calling center.", 0.84, "confirm"),
                ("edge_12", "suspect_rahul_cyber", "suspect_neha_recruiter", "SUPERVISES", "WhatsApp Export", "Rahul assigns daily telecalling targets to Neha Chawla.", 0.87, "confirm"),
                ("edge_13", "suspect_neha_recruiter", "loc_call_hub_gurgaon", "OPERATED_FROM", "Lease Agreement", "Office lease signed in Gurgaon by recruiter Neha Chawla.", 0.81, "confirm"),
                ("edge_14", "suspect_karan_bridge2", "suspect_priya_m", "SETTLED_CASH", "Ledger Diary", "Physical cash delivery receipts found matching Priya Mehra's accounting ledger.", 0.79, "pending"),
                ("edge_15", "suspect_karan_bridge2", "suspect_imran_logistics", "DISPATCHED_VEHICLE", "Toll Plaza Fastag", "Coordinated convoy travel across Delhi-Faridabad toll barrier.", 0.83, "confirm"),
                ("edge_16", "suspect_imran_logistics", "vehicle_scorpio_white", "DRIVES_REGULARLY", "CCTV ANPR", "CCTV captures Imran driving UP16AX3344 near Sector 63 drop site.", 0.92, "confirm"),
                ("edge_17", "suspect_imran_logistics", "suspect_tariq_driver", "EMPLOYS_DRIVER", "CDR / Field Intel", "Tariq Mansoor acts as designated cash mule driver under Imran's orders.", 0.85, "confirm"),
                ("edge_18", "suspect_imran_logistics", "loc_warehousing_noida", "CONTROLS_KEY", "Search & Seizure", "Subpoenaed rental agreement for Sector 63 warehouse in Imran's alias.", 0.94, "confirm"),
                ("edge_19", "suspect_tariq_driver", "suspect_amit_mule", "PICKED_UP_ATM_CARD", "ATM Surveillance", "Tariq collected debit cards from mule Amit Kasana for cash withdrawals.", 0.76, "pending"),
            ]
            _seed_edges(db, "CASE-26189", edges_26189)

        # ════════════════════════════════════════════════════════════════
        # 5. SEED GRAPH — CASE-26190 (Project Chakravyuh)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26190").count() == 0:
            nodes_26190 = [
                {"node_id": "chk_ringleader_farhan", "label": "Farhan Ansari", "entity_type": "PERSON",
                 "aliases": ["Farhan Bhai", "Don Mewat"], "phone": "+919876501234",
                 "latitude": 28.1050, "longitude": 76.9950,
                 "properties": {"role": "SIM Cloning Ringleader", "risk_score": 96, "call_count": 310}},
                {"node_id": "chk_deepfake_tech", "label": "Akash Yadav", "entity_type": "PERSON",
                 "aliases": ["Techy Akash"], "phone": "+919812345678",
                 "latitude": 28.0800, "longitude": 77.0100,
                 "properties": {"role": "AI Deepfake Voice Operator", "risk_score": 92, "call_count": 180}},
                {"node_id": "chk_sim_factory", "label": "Nuh SIM Cloning Lab", "entity_type": "LOCATION",
                 "latitude": 28.0950, "longitude": 76.9850,
                 "properties": {"role": "SIM Card Duplication Factory", "risk_score": 94}},
                {"node_id": "chk_voip_server", "label": "VoIP PBX Server (Offshore)", "entity_type": "ORGANIZATION",
                 "latitude": 28.1100, "longitude": 77.0000,
                 "properties": {"role": "Call Spoofing Infrastructure", "risk_score": 90}},
                {"node_id": "chk_mule_handler", "label": "Saleem Khan", "entity_type": "PERSON",
                 "aliases": ["Saleem ATM"], "phone": "+919998765432",
                 "latitude": 28.1300, "longitude": 77.0400,
                 "properties": {"role": "Mule Account Handler", "risk_score": 78, "call_count": 95}},
                {"node_id": "chk_vehicle_van", "label": "Maruti Eeco — HR55AC7890", "entity_type": "VEHICLE",
                 "vehicle_plate": "HR55AC7890", "latitude": 28.1050, "longitude": 76.9950,
                 "properties": {"role": "Mobile SIM Lab Vehicle"}},
                {"node_id": "chk_phone_spoof", "label": "+919876501234 (Spoofed Police Line)", "entity_type": "PHONE",
                 "phone": "+919876501234", "latitude": 28.1050, "longitude": 76.9950,
                 "properties": {"role": "Primary Spoofing SIM"}},
                {"node_id": "chk_elderly_target", "label": "Victim Pattern: Elderly Women (Tier-2)", "entity_type": "PERSON",
                 "latitude": 26.8500, "longitude": 80.9100,
                 "properties": {"role": "Target Demographic Profile", "risk_score": 0}},
            ]
            _seed_nodes(db, "CASE-26190", nodes_26190)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26190").count() == 0:
            edges_26190 = [
                ("chk_e1", "chk_ringleader_farhan", "chk_sim_factory", "OPERATES", "Raid Recovery", "Farhan Ansari's fingerprints on SIM cloning equipment recovered during Nuh raid.", 0.95, "confirm"),
                ("chk_e2", "chk_ringleader_farhan", "chk_deepfake_tech", "DIRECTS", "CDR & WhatsApp", "Farhan assigns daily deepfake calling targets to Akash via encrypted WhatsApp.", 0.90, "confirm"),
                ("chk_e3", "chk_deepfake_tech", "chk_voip_server", "ADMINISTERS", "Server Logs", "Akash Yadav's credentials found as admin on offshore VoIP PBX server.", 0.88, "confirm"),
                ("chk_e4", "chk_ringleader_farhan", "chk_mule_handler", "COORDINATES", "Banking Trail", "Farhan routes extortion proceeds through Saleem's network of mule accounts.", 0.85, "confirm"),
                ("chk_e5", "chk_ringleader_farhan", "chk_vehicle_van", "REGISTERED_OWNER", "Vahan Registry", "HR55AC7890 registered to Farhan Ansari at Nuh, Mewat address.", 0.97, "confirm"),
                ("chk_e6", "chk_ringleader_farhan", "chk_phone_spoof", "SUBSCRIBER_OF", "CAF Records", "Primary spoofing SIM registered under forged KYC documents linked to Farhan.", 0.86, "confirm"),
                ("chk_e7", "chk_deepfake_tech", "chk_elderly_target", "TARGETED_VICTIMS", "Call Logs", "Over 200 outbound spoofed calls targeting elderly women in UP and MP districts.", 0.82, "confirm"),
                ("chk_e8", "chk_mule_handler", "chk_sim_factory", "SUPPLIED_SIMS", "Witness Statement", "Saleem provided bulk pre-activated SIMs from the Nuh cloning lab.", 0.78, "pending"),
            ]
            _seed_edges(db, "CASE-26190", edges_26190)

        # ════════════════════════════════════════════════════════════════
        # 6. SEED GRAPH — CASE-26191 (Operation Saffron - Crypto)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26191").count() == 0:
            nodes_26191 = [
                {"node_id": "saf_mastermind_arjun", "label": "Arjun Deshmukh", "entity_type": "PERSON",
                 "aliases": ["CryptoKing", "ADesH"], "phone": "+919823456789",
                 "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Crypto Laundering Mastermind", "risk_score": 97, "call_count": 145, "crypto_volume_btc": 42.5}},
                {"node_id": "saf_darkweb_admin", "label": "Rohan Pillai", "entity_type": "PERSON",
                 "aliases": ["DarkPhoenix", "BazaarX Admin"], "phone": "+919845678901",
                 "latitude": 12.9716, "longitude": 77.5946,
                 "properties": {"role": "Dark Web Marketplace Admin", "risk_score": 95, "call_count": 88}},
                {"node_id": "saf_exchange_shell", "label": "QuickSwap Digital Assets Pvt Ltd", "entity_type": "ORGANIZATION",
                 "latitude": 19.0178, "longitude": 72.8478,
                 "properties": {"role": "Unlicensed P2P Crypto Exchange", "risk_score": 91}},
                {"node_id": "saf_wallet_cold", "label": "Monero Wallet (xmr...9f4a)", "entity_type": "ACCOUNT",
                 "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Privacy Coin Cold Wallet", "risk_score": 89, "balance_inr_equiv": 12500000}},
                {"node_id": "saf_mixer_node", "label": "TorMix Tumbling Service", "entity_type": "ORGANIZATION",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Crypto Mixing/Tumbling", "risk_score": 87}},
                {"node_id": "saf_mule_pradeep", "label": "Pradeep Joshi", "entity_type": "PERSON",
                 "aliases": ["PJ Cash"], "phone": "+919867890123",
                 "latitude": 18.5204, "longitude": 73.8567,
                 "properties": {"role": "Fiat Cash-Out Mule", "risk_score": 72, "call_count": 55}},
                {"node_id": "saf_laptop_seized", "label": "MacBook Pro (Serial: C02X...)", "entity_type": "DEVICE",
                 "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Seized Primary Device", "risk_score": 85}},
            ]
            _seed_nodes(db, "CASE-26191", nodes_26191)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26191").count() == 0:
            edges_26191 = [
                ("saf_e1", "saf_mastermind_arjun", "saf_exchange_shell", "BENEFICIAL_OWNER", "MCA Filings", "Arjun Deshmukh is 78% beneficial owner of QuickSwap Digital Assets as per MCA ROC.", 0.94, "confirm"),
                ("saf_e2", "saf_mastermind_arjun", "saf_wallet_cold", "CONTROLS_WALLET", "Blockchain Forensics", "On-chain analysis traces wallet funding source to Arjun's verified KYC exchange account.", 0.91, "confirm"),
                ("saf_e3", "saf_darkweb_admin", "saf_mixer_node", "OPERATED_VIA", "Server Seizure Logs", "Rohan's SSH keys found on TorMix tumbling service server.", 0.87, "confirm"),
                ("saf_e4", "saf_mastermind_arjun", "saf_darkweb_admin", "COORDINATED_WITH", "Telegram Intercept", "Encrypted Telegram channel shows Arjun directing marketplace listing schedules.", 0.89, "confirm"),
                ("saf_e5", "saf_mastermind_arjun", "saf_mule_pradeep", "DIRECTED_CASHOUT", "Bank Trail", "Fiat disbursements from QuickSwap to Pradeep's accounts for cash withdrawals.", 0.83, "confirm"),
                ("saf_e6", "saf_mastermind_arjun", "saf_laptop_seized", "DEVICE_OWNER", "Search & Seizure", "Seized MacBook contains BazaarX admin panel bookmarks and Monero wallet keys.", 0.96, "confirm"),
                ("saf_e7", "saf_darkweb_admin", "saf_exchange_shell", "LAUNDERED_VIA", "Financial Audit", "₹2.5 Cr traced from BazaarX sales proceeds through QuickSwap exchange accounts.", 0.85, "confirm"),
                ("saf_e8", "saf_mule_pradeep", "saf_wallet_cold", "RECEIVED_CRYPTO", "Blockchain", "12.3 XMR transferred to Pradeep-linked wallet before fiat conversion.", 0.80, "pending"),
            ]
            _seed_edges(db, "CASE-26191", edges_26191)

        # ════════════════════════════════════════════════════════════════
        # 7. SEED GRAPH — CASE-26192 (Operation Trident - Trafficking)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26192").count() == 0:
            nodes_26192 = [
                {"node_id": "tri_kingpin_rajan", "label": "Rajan Tiwari", "entity_type": "PERSON",
                 "aliases": ["Raja Sahab", "RT Boss"], "phone": "+919771234567",
                 "latitude": 25.6093, "longitude": 85.1376,
                 "properties": {"role": "Trafficking Network Kingpin", "risk_score": 99, "call_count": 267}},
                {"node_id": "tri_recruiter_sunita", "label": "Sunita Devi", "entity_type": "PERSON",
                 "aliases": ["Mausi", "Placement Madam"], "phone": "+919835678901",
                 "latitude": 23.3441, "longitude": 85.3096,
                 "properties": {"role": "Rural Area Recruiter", "risk_score": 88, "call_count": 156}},
                {"node_id": "tri_safehouse_delhi", "label": "Shakurpur Safehouse", "entity_type": "LOCATION",
                 "latitude": 28.6910, "longitude": 77.1540,
                 "properties": {"role": "Transit Safehouse Delhi", "risk_score": 90}},
                {"node_id": "tri_fake_agency", "label": "Lakshmi Domestic Services (Fake)", "entity_type": "ORGANIZATION",
                 "latitude": 28.6328, "longitude": 77.2197,
                 "properties": {"role": "Fake Placement Agency Front", "risk_score": 93}},
                {"node_id": "tri_transporter_mohan", "label": "Mohan Yadav", "entity_type": "PERSON",
                 "aliases": ["Mohan Driver"], "phone": "+919955123456", "vehicle_plate": "BR01AK5566",
                 "latitude": 25.3176, "longitude": 82.9739,
                 "properties": {"role": "Interstate Transporter", "risk_score": 81, "call_count": 92}},
                {"node_id": "tri_vehicle_bus", "label": "Modified Bus — BR01AK5566", "entity_type": "VEHICLE",
                 "vehicle_plate": "BR01AK5566", "latitude": 25.6093, "longitude": 85.1376,
                 "properties": {"role": "Victim Transport Vehicle"}},
                {"node_id": "tri_whatsapp_group", "label": "WhatsApp Group: 'Naukri Updates'", "entity_type": "ACCOUNT",
                 "latitude": 25.6093, "longitude": 85.1376,
                 "properties": {"role": "Coded Victim Coordination Channel", "risk_score": 86, "members": 47}},
                {"node_id": "tri_financial_bablu", "label": "Bablu Prasad", "entity_type": "PERSON",
                 "aliases": ["Bablu Finance"], "phone": "+919876543210",
                 "latitude": 28.5672, "longitude": 77.3211,
                 "properties": {"role": "Financial Handler", "risk_score": 76, "call_count": 64}},
            ]
            _seed_nodes(db, "CASE-26192", nodes_26192)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26192").count() == 0:
            edges_26192 = [
                ("tri_e1", "tri_kingpin_rajan", "tri_fake_agency", "CONTROLS", "Shop Registration", "Rajan Tiwari registered as proprietor of Lakshmi Domestic Services under alias.", 0.94, "confirm"),
                ("tri_e2", "tri_kingpin_rajan", "tri_recruiter_sunita", "DIRECTS", "CDR Analysis", "267 calls between Rajan and Sunita during peak recruitment periods.", 0.92, "confirm"),
                ("tri_e3", "tri_recruiter_sunita", "tri_whatsapp_group", "ADMINISTERS", "Digital Forensics", "Sunita is admin of coded WhatsApp group used for victim logistics.", 0.88, "confirm"),
                ("tri_e4", "tri_kingpin_rajan", "tri_transporter_mohan", "EMPLOYS", "Witness Statement", "Mohan confessed to transporting victims under Rajan's instructions.", 0.86, "confirm"),
                ("tri_e5", "tri_transporter_mohan", "tri_vehicle_bus", "DRIVES", "Vahan & CCTV", "ANPR captures Mohan driving BR01AK5566 on Bihar-Delhi highway corridor.", 0.93, "confirm"),
                ("tri_e6", "tri_transporter_mohan", "tri_safehouse_delhi", "DELIVERED_TO", "Surveillance", "GPS trail of vehicle ends at Shakurpur safehouse on 12 occasions.", 0.87, "confirm"),
                ("tri_e7", "tri_kingpin_rajan", "tri_financial_bablu", "FUNDS_VIA", "Bank Records", "Monthly cash transfers of ₹2-5 lakh from Rajan to Bablu's accounts.", 0.84, "confirm"),
                ("tri_e8", "tri_financial_bablu", "tri_safehouse_delhi", "PAYS_RENT", "Lease Records", "Safehouse rent paid from account linked to Bablu Prasad.", 0.81, "pending"),
                ("tri_e9", "tri_recruiter_sunita", "tri_fake_agency", "RECRUITS_FOR", "Victim Testimony", "Rescued victims identify Sunita as the person who brought them to the 'agency'.", 0.90, "confirm"),
            ]
            _seed_edges(db, "CASE-26192", edges_26192)

        # ════════════════════════════════════════════════════════════════
        # 8. SEED GRAPH — CASE-26193 (Operation Garuda - Drugs)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26193").count() == 0:
            nodes_26193 = [
                {"node_id": "gar_boss_harpreet", "label": "Harpreet Singh", "entity_type": "PERSON",
                 "aliases": ["Happy Bhai", "Border King"], "phone": "+919815001234",
                 "latitude": 31.1048, "longitude": 75.3461,
                 "properties": {"role": "Drug Cartel Boss", "risk_score": 98, "call_count": 203}},
                {"node_id": "gar_courier_jeet", "label": "Jeetendra Meena", "entity_type": "PERSON",
                 "aliases": ["Jeetu Runner"], "phone": "+919828567890", "vehicle_plate": "RJ14CT8899",
                 "latitude": 26.9124, "longitude": 70.9020,
                 "properties": {"role": "Desert Route Courier", "risk_score": 85, "call_count": 78}},
                {"node_id": "gar_arms_dealer", "label": "Ghulam Nabi", "entity_type": "PERSON",
                 "aliases": ["Nabi Arms"], "phone": "+919906123456",
                 "latitude": 32.7266, "longitude": 74.8570,
                 "properties": {"role": "Arms Supplier", "risk_score": 93, "call_count": 45}},
                {"node_id": "gar_hideout_thar", "label": "Thar Desert Cache Point", "entity_type": "LOCATION",
                 "latitude": 26.2389, "longitude": 70.6686,
                 "properties": {"role": "Drug & Arms Cache", "risk_score": 88}},
                {"node_id": "gar_hawala_op", "label": "Mohammed Rafiq", "entity_type": "PERSON",
                 "aliases": ["Rafiq Hawala"], "phone": "+919876009876",
                 "latitude": 30.7333, "longitude": 76.7794,
                 "properties": {"role": "Cross-Border Hawala Operator", "risk_score": 90, "call_count": 134}},
                {"node_id": "gar_truck_fleet", "label": "Modified Truck — RJ14CT8899", "entity_type": "VEHICLE",
                 "vehicle_plate": "RJ14CT8899", "latitude": 26.9124, "longitude": 70.9020,
                 "properties": {"role": "Drug Transport (Hidden Compartment)"}},
                {"node_id": "gar_telegram_channel", "label": "Telegram: 'Kisan Mandi'", "entity_type": "ACCOUNT",
                 "latitude": 31.1048, "longitude": 75.3461,
                 "properties": {"role": "Encrypted Drug Coordination Channel", "risk_score": 86}},
            ]
            _seed_nodes(db, "CASE-26193", nodes_26193)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26193").count() == 0:
            edges_26193 = [
                ("gar_e1", "gar_boss_harpreet", "gar_courier_jeet", "DISPATCHES", "CDR & Surveillance", "Harpreet dispatches Jeetendra for Thar desert route runs via encrypted calls.", 0.91, "confirm"),
                ("gar_e2", "gar_boss_harpreet", "gar_arms_dealer", "PROCURES_FROM", "Intelligence Report", "BSF intelligence links Harpreet to Ghulam's cross-border arms supply chain.", 0.87, "confirm"),
                ("gar_e3", "gar_courier_jeet", "gar_hideout_thar", "VISITS_REGULARLY", "GPS Tracking", "Jeetu's phone GPS shows 14 visits to Thar cache point in last 3 months.", 0.90, "confirm"),
                ("gar_e4", "gar_courier_jeet", "gar_truck_fleet", "DRIVES", "Vahan & Toll Data", "Toll fastag data confirms RJ14CT8899 on Punjab-Rajasthan corridor.", 0.94, "confirm"),
                ("gar_e5", "gar_boss_harpreet", "gar_hawala_op", "SETTLES_VIA", "Financial Intel", "Hawala settlements of ₹30 lakh traced between Harpreet and Rafiq.", 0.86, "confirm"),
                ("gar_e6", "gar_boss_harpreet", "gar_telegram_channel", "ADMINISTERS", "Digital Forensics", "Harpreet's device contains admin access to 'Kisan Mandi' Telegram channel.", 0.89, "confirm"),
                ("gar_e7", "gar_arms_dealer", "gar_hideout_thar", "SUPPLIED_TO", "Seizure Report", "Arms cache at Thar point matches serial numbers from Ghulam's inventory.", 0.83, "pending"),
            ]
            _seed_edges(db, "CASE-26193", edges_26193)

        # ════════════════════════════════════════════════════════════════
        # 9. SEED GRAPH — CASE-26194 (Operation Shield - Identity Theft)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26194").count() == 0:
            nodes_26194 = [
                {"node_id": "shd_mastermind_nikhil", "label": "Nikhil Agarwal", "entity_type": "PERSON",
                 "aliases": ["Aadhaar King", "NA Fraud"], "phone": "+919412345678",
                 "latitude": 26.8467, "longitude": 80.9462,
                 "properties": {"role": "Identity Fraud Mastermind", "risk_score": 96, "call_count": 178}},
                {"node_id": "shd_enroll_center", "label": "Compromised Aadhaar Center (Lucknow)", "entity_type": "LOCATION",
                 "latitude": 26.8467, "longitude": 80.9462,
                 "properties": {"role": "Compromised UIDAI Enrollment Center", "risk_score": 92}},
                {"node_id": "shd_shell_microfi", "label": "Grameen Sahayak Micro-Finance", "entity_type": "ORGANIZATION",
                 "latitude": 26.4499, "longitude": 80.3319,
                 "properties": {"role": "Shell Micro-Finance Company", "risk_score": 89}},
                {"node_id": "shd_data_seller", "label": "Deepak Mishra", "entity_type": "PERSON",
                 "aliases": ["Data Deepak"], "phone": "+919452345678",
                 "latitude": 23.1815, "longitude": 79.9864,
                 "properties": {"role": "Stolen Data Broker", "risk_score": 84, "call_count": 123}},
                {"node_id": "shd_mule_network", "label": "Mule Account Network (200+ accounts)", "entity_type": "ACCOUNT",
                 "latitude": 26.8467, "longitude": 80.9462,
                 "properties": {"role": "Fake Aadhaar-Linked Bank Accounts", "risk_score": 88, "account_count": 217}},
                {"node_id": "shd_beneficiary_fraud", "label": "Welfare Scheme Diversion Pattern", "entity_type": "ORGANIZATION",
                 "latitude": 25.4358, "longitude": 81.8463,
                 "properties": {"role": "Government Subsidy Siphoning", "risk_score": 91}},
            ]
            _seed_nodes(db, "CASE-26194", nodes_26194)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26194").count() == 0:
            edges_26194 = [
                ("shd_e1", "shd_mastermind_nikhil", "shd_enroll_center", "COMPROMISED", "UIDAI Audit", "Nikhil bribed enrollment operator to generate fake Aadhaar numbers.", 0.93, "confirm"),
                ("shd_e2", "shd_mastermind_nikhil", "shd_shell_microfi", "CONTROLS", "MCA Records", "Nikhil is shadow director of Grameen Sahayak via benami arrangement.", 0.88, "confirm"),
                ("shd_e3", "shd_mastermind_nikhil", "shd_data_seller", "PURCHASES_FROM", "Digital Trail", "Nikhil purchased 50,000 stolen Aadhaar-PAN pairs from Deepak Mishra.", 0.86, "confirm"),
                ("shd_e4", "shd_data_seller", "shd_mule_network", "GENERATED", "Bank Audit", "Stolen identity data used to open 200+ fake bank accounts.", 0.84, "confirm"),
                ("shd_e5", "shd_shell_microfi", "shd_beneficiary_fraud", "DIVERTED_FUNDS", "CAG Report", "₹4.7 Cr in welfare subsidies diverted through Grameen Sahayak accounts.", 0.90, "confirm"),
                ("shd_e6", "shd_mule_network", "shd_shell_microfi", "FUNNELED_TO", "Financial Analysis", "Mule account funds consolidated into Grameen Sahayak master account.", 0.82, "pending"),
            ]
            _seed_edges(db, "CASE-26194", edges_26194)

        # ════════════════════════════════════════════════════════════════
        # 10. SEED GRAPH — CASE-26195 (Operation Thunderbolt - Extortion)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26195").count() == 0:
            nodes_26195 = [
                {"node_id": "thd_boss_patil", "label": "Suresh Patil", "entity_type": "PERSON",
                 "aliases": ["SP Don", "Builder Boss"], "phone": "+919820123456",
                 "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Extortion Ring Leader", "risk_score": 95, "call_count": 198}},
                {"node_id": "thd_deepfake_op", "label": "Vishal Thakur", "entity_type": "PERSON",
                 "aliases": ["Fake CBI"], "phone": "+919833456789",
                 "latitude": 18.5204, "longitude": 73.8567,
                 "properties": {"role": "Deepfake Call Operator", "risk_score": 91, "call_count": 145}},
                {"node_id": "thd_political_nexus", "label": "Anonymous Political Contact", "entity_type": "PERSON",
                 "aliases": ["Neta Ji"], "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Political Protector", "risk_score": 80}},
                {"node_id": "thd_social_media_cell", "label": "Harassment Bot Network", "entity_type": "ORGANIZATION",
                 "latitude": 18.5204, "longitude": 73.8567,
                 "properties": {"role": "Coordinated Social Media Attack Infrastructure", "risk_score": 88}},
                {"node_id": "thd_realestate_front", "label": "Shree Ganesh Builders (Front)", "entity_type": "ORGANIZATION",
                 "latitude": 19.2183, "longitude": 72.9781,
                 "properties": {"role": "Real Estate Money Laundering Front", "risk_score": 86}},
                {"node_id": "thd_victim_women_biz", "label": "Victim Pattern: Women Entrepreneurs", "entity_type": "PERSON",
                 "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Target Profile — Women Business Owners", "risk_score": 0}},
            ]
            _seed_nodes(db, "CASE-26195", nodes_26195)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26195").count() == 0:
            edges_26195 = [
                ("thd_e1", "thd_boss_patil", "thd_deepfake_op", "DIRECTS", "CDR Analysis", "Suresh directs Vishal's deepfake CBI impersonation campaigns.", 0.92, "confirm"),
                ("thd_e2", "thd_boss_patil", "thd_political_nexus", "PROTECTED_BY", "Surveillance Intel", "Meetings between Patil and political contact intercepted.", 0.75, "pending"),
                ("thd_e3", "thd_deepfake_op", "thd_social_media_cell", "OPERATES", "Server Forensics", "Vishal administers bot network used for victim harassment campaigns.", 0.88, "confirm"),
                ("thd_e4", "thd_boss_patil", "thd_realestate_front", "LAUNDERS_VIA", "ED Investigation", "Extortion proceeds invested in Shree Ganesh Builders shell projects.", 0.85, "confirm"),
                ("thd_e5", "thd_social_media_cell", "thd_victim_women_biz", "TARGETS", "Victim Complaints", "Bot network sent 5,000+ abusive messages to women business owners.", 0.90, "confirm"),
                ("thd_e6", "thd_deepfake_op", "thd_victim_women_biz", "IMPERSONATED_CBI", "Call Records", "Fabricated CBI/ED arrest warrant calls to 120+ women entrepreneurs.", 0.87, "confirm"),
            ]
            _seed_edges(db, "CASE-26195", edges_26195)

        # ════════════════════════════════════════════════════════════════
        # 11. SEED GRAPH — CASE-26196 (Operation Neptune - Smuggling)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26196").count() == 0:
            nodes_26196 = [
                {"node_id": "nep_boss_merchant", "label": "Kishore Mehta", "entity_type": "PERSON",
                 "aliases": ["KM Imports", "Port King"], "phone": "+919821987654",
                 "latitude": 18.9388, "longitude": 72.8354,
                 "properties": {"role": "Smuggling Network Head", "risk_score": 94, "call_count": 167}},
                {"node_id": "nep_customs_corrupt", "label": "Officer Rajendra (Corrupt)", "entity_type": "PERSON",
                 "aliases": ["Customs Raja"], "phone": "+919876112233",
                 "latitude": 22.4707, "longitude": 70.0577,
                 "properties": {"role": "Corrupt Customs Official", "risk_score": 87, "call_count": 56}},
                {"node_id": "nep_port_mundra", "label": "Mundra Port Container Yard", "entity_type": "LOCATION",
                 "latitude": 22.8390, "longitude": 69.7292,
                 "properties": {"role": "Primary Import Point", "risk_score": 82}},
                {"node_id": "nep_dubai_hawala", "label": "Dubai Hawala Channel", "entity_type": "ORGANIZATION",
                 "latitude": 25.2048, "longitude": 55.2708,
                 "properties": {"role": "Cross-Border Hawala Settlement", "risk_score": 90}},
                {"node_id": "nep_container_id", "label": "Container MSKU-7284910", "entity_type": "VEHICLE",
                 "latitude": 22.8390, "longitude": 69.7292,
                 "properties": {"role": "Mislabeled Shipping Container"}},
                {"node_id": "nep_warehouse_mumbai", "label": "Bhiwandi Godown", "entity_type": "LOCATION",
                 "latitude": 19.2812, "longitude": 73.0551,
                 "properties": {"role": "Smuggled Goods Storage", "risk_score": 78}},
            ]
            _seed_nodes(db, "CASE-26196", nodes_26196)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26196").count() == 0:
            edges_26196 = [
                ("nep_e1", "nep_boss_merchant", "nep_customs_corrupt", "BRIBES", "Sting Operation", "Kishore pays monthly retainer to customs officer for container clearance.", 0.89, "confirm"),
                ("nep_e2", "nep_boss_merchant", "nep_port_mundra", "IMPORTS_VIA", "Bill of Lading", "Over 40 mislabeled containers cleared at Mundra in Kishore's company name.", 0.93, "confirm"),
                ("nep_e3", "nep_boss_merchant", "nep_dubai_hawala", "SETTLES_VIA", "Financial Intel", "Payment for smuggled goods routed through Dubai hawala channel.", 0.86, "confirm"),
                ("nep_e4", "nep_customs_corrupt", "nep_container_id", "CLEARED", "Port Records", "Officer Rajendra signed clearance for flagged container MSKU-7284910.", 0.91, "confirm"),
                ("nep_e5", "nep_boss_merchant", "nep_warehouse_mumbai", "STORES_AT", "Raid Recovery", "Smuggled electronics worth ₹12 Cr recovered from Bhiwandi godown.", 0.94, "confirm"),
                ("nep_e6", "nep_container_id", "nep_port_mundra", "ARRIVED_AT", "Shipping Logs", "Container MSKU-7284910 arrived from Jebel Ali port with forged manifest.", 0.88, "confirm"),
            ]
            _seed_edges(db, "CASE-26196", edges_26196)

        # ════════════════════════════════════════════════════════════════
        # 12. SEED GRAPH — CASE-26197 (Operation Falcon - Corruption)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26197").count() == 0:
            nodes_26197 = [
                {"node_id": "fal_politician", "label": "Ajay Srivastava (IAS, Retd.)", "entity_type": "PERSON",
                 "aliases": ["AS Sir", "Property King"], "phone": "+919811223344",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Primary Beneficiary", "risk_score": 93, "call_count": 89}},
                {"node_id": "fal_ca_enabler", "label": "CA Manoj Gupta", "entity_type": "PERSON",
                 "aliases": ["Fixer Manoj"], "phone": "+919810445566",
                 "latitude": 28.6328, "longitude": 77.2197,
                 "properties": {"role": "Chartered Accountant / Shell Creator", "risk_score": 87, "call_count": 112}},
                {"node_id": "fal_shell_1", "label": "Zenith Infra Holdings Pvt Ltd", "entity_type": "ORGANIZATION",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Shell Company Layer 1", "risk_score": 85}},
                {"node_id": "fal_shell_2", "label": "Pinnacle Buildcon LLP", "entity_type": "ORGANIZATION",
                 "latitude": 22.5726, "longitude": 88.3639,
                 "properties": {"role": "Shell Company Layer 2 (Kolkata)", "risk_score": 84}},
                {"node_id": "fal_offshore", "label": "Singapore Offshore Trust", "entity_type": "ACCOUNT",
                 "latitude": 1.3521, "longitude": 103.8198,
                 "properties": {"role": "Offshore Fund Parking", "risk_score": 91, "amount_usd": 2800000}},
                {"node_id": "fal_benami_prop", "label": "Benami Farmhouse (Chattarpur)", "entity_type": "LOCATION",
                 "latitude": 28.4606, "longitude": 77.1595,
                 "properties": {"role": "Undisclosed Benami Property", "risk_score": 82, "estimated_value_cr": 45}},
                {"node_id": "fal_contractor", "label": "Ravi Constructions Pvt Ltd", "entity_type": "ORGANIZATION",
                 "latitude": 28.5355, "longitude": 77.2410,
                 "properties": {"role": "Favored Infrastructure Contractor", "risk_score": 79}},
            ]
            _seed_nodes(db, "CASE-26197", nodes_26197)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26197").count() == 0:
            edges_26197 = [
                ("fal_e1", "fal_politician", "fal_ca_enabler", "ENGAGED", "Phone Intercept", "Ajay Srivastava engaged CA Manoj to create shell company network.", 0.90, "confirm"),
                ("fal_e2", "fal_ca_enabler", "fal_shell_1", "INCORPORATED", "MCA ROC", "CA Manoj incorporated Zenith Infra with dummy directors.", 0.93, "confirm"),
                ("fal_e3", "fal_ca_enabler", "fal_shell_2", "INCORPORATED", "MCA ROC", "Pinnacle Buildcon LLP created in Kolkata as layering entity.", 0.91, "confirm"),
                ("fal_e4", "fal_shell_1", "fal_shell_2", "TRANSFERRED_FUNDS", "Bank Trail", "₹18 Cr transferred from Zenith to Pinnacle in structured transactions.", 0.88, "confirm"),
                ("fal_e5", "fal_shell_2", "fal_offshore", "REMITTED_ABROAD", "FEMA Records", "₹23 Cr remitted to Singapore trust via dubious trade invoicing.", 0.85, "confirm"),
                ("fal_e6", "fal_politician", "fal_benami_prop", "BENEFICIARY_OF", "IT Raid", "Income Tax raid revealed Chattarpur farmhouse in benami holder's name.", 0.87, "confirm"),
                ("fal_e7", "fal_politician", "fal_contractor", "AWARDED_CONTRACT", "RTI Documents", "Ravi Constructions awarded ₹200 Cr highway contract without proper bidding.", 0.82, "confirm"),
                ("fal_e8", "fal_contractor", "fal_shell_1", "KICKBACK_TO", "Forensic Audit", "₹8 Cr kickback payments from Ravi to Zenith traced by auditors.", 0.80, "pending"),
            ]
            _seed_edges(db, "CASE-26197", edges_26197)

        # ════════════════════════════════════════════════════════════════
        # 13. SEED GRAPH — CASE-26198 (Operation Viper - Cyberstalking)
        # ════════════════════════════════════════════════════════════════
        if db.query(GraphNode).filter(GraphNode.case_id == "CASE-26198").count() == 0:
            nodes_26198 = [
                {"node_id": "vip_mastermind_rohit", "label": "Rohit Saxena", "entity_type": "PERSON",
                 "aliases": ["Dark Coder", "RX Hack"], "phone": "+919650123456",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Cyberstalking Network Mastermind", "risk_score": 97, "call_count": 134}},
                {"node_id": "vip_deepfake_creator", "label": "Aditya Verma", "entity_type": "PERSON",
                 "aliases": ["AI Adi"], "phone": "+919876543210",
                 "latitude": 12.9716, "longitude": 77.5946,
                 "properties": {"role": "Deepfake Content Creator", "risk_score": 94, "call_count": 89}},
                {"node_id": "vip_bot_army", "label": "Twitter/X Bot Army (2,500 bots)", "entity_type": "ORGANIZATION",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Coordinated Harassment Bot Network", "risk_score": 92, "bot_count": 2500}},
                {"node_id": "vip_cloud_server", "label": "Compromised AWS Server (ap-south-1)", "entity_type": "DEVICE",
                 "latitude": 19.0760, "longitude": 72.8777,
                 "properties": {"role": "Deepfake Hosting & C2 Server", "risk_score": 90}},
                {"node_id": "vip_telegram_bot", "label": "Telegram Bot: @doxx_finder", "entity_type": "ACCOUNT",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Automated Doxxing Tool", "risk_score": 88}},
                {"node_id": "vip_victim_journalist", "label": "Victim Pattern: Women Journalists", "entity_type": "PERSON",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Primary Target Demographic", "risk_score": 0, "victims_identified": 34}},
                {"node_id": "vip_payment_crypto", "label": "USDT Wallet (0xAB12...)", "entity_type": "ACCOUNT",
                 "latitude": 28.6139, "longitude": 77.2090,
                 "properties": {"role": "Harassment-as-a-Service Payment", "risk_score": 83}},
            ]
            _seed_nodes(db, "CASE-26198", nodes_26198)

        if db.query(GraphEdge).filter(GraphEdge.case_id == "CASE-26198").count() == 0:
            edges_26198 = [
                ("vip_e1", "vip_mastermind_rohit", "vip_deepfake_creator", "COMMISSIONS", "Telegram Chat Export", "Rohit commissions deepfake content from Aditya for specific victims.", 0.92, "confirm"),
                ("vip_e2", "vip_mastermind_rohit", "vip_bot_army", "CONTROLS", "Server Analysis", "Rohit's SSH keys found as root admin on bot army C2 server.", 0.94, "confirm"),
                ("vip_e3", "vip_deepfake_creator", "vip_cloud_server", "HOSTS_ON", "AWS Subpoena", "Deepfake videos hosted on compromised AWS instance traced to Aditya.", 0.89, "confirm"),
                ("vip_e4", "vip_mastermind_rohit", "vip_telegram_bot", "DEVELOPED", "Code Analysis", "Source code of @doxx_finder bot contains Rohit's GitHub commit signatures.", 0.91, "confirm"),
                ("vip_e5", "vip_bot_army", "vip_victim_journalist", "HARASSED", "Platform Reports", "2,500 bot accounts sent 50,000+ abusive messages to women journalists.", 0.93, "confirm"),
                ("vip_e6", "vip_deepfake_creator", "vip_victim_journalist", "CREATED_DEEPFAKES", "Content Hash", "34 deepfake videos created targeting identified women journalists.", 0.90, "confirm"),
                ("vip_e7", "vip_mastermind_rohit", "vip_payment_crypto", "RECEIVES_PAYMENT", "Blockchain Analysis", "Payments for 'harassment campaigns' received in USDT on-chain.", 0.86, "confirm"),
                ("vip_e8", "vip_telegram_bot", "vip_victim_journalist", "DOXXED", "Bot Logs", "Personal addresses and phone numbers of 34 victims published via bot.", 0.88, "confirm"),
            ]
            _seed_edges(db, "CASE-26198", edges_26198)

        # ════════════════════════════════════════════════════════════════
        # 14. SEED ALERTS ACROSS ALL MAJOR CASES
        # ════════════════════════════════════════════════════════════════
        if db.query(Alert).count() == 0:
            all_alerts = [
                # CASE-26189 Alerts
                Alert(case_id="CASE-26189", alert_type="ANOMALY_CALL_BURST", title="Extreme Late-Night Burst Communication Flagged",
                      description="Suspect Devender @ Lala exhibited 412 calls with 88% late-night frequency (01:00-05:00 hrs) and switched 9 cell towers across district borders within 48 hours.",
                      severity="CRITICAL", node_ids=json.dumps(["suspect_devender_anomaly"]), anomaly_score=0.96, created_at=datetime.utcnow()),
                Alert(case_id="CASE-26189", alert_type="HIGH_BETWEENNESS_BRIDGE", title="Key Syndicate Bridge / Broker Identified",
                      description="Entity 'Vikram Malhotra' has a high Betweenness Centrality score (0.482), acting as the exclusive conduit connecting Hawala operations to the Mewat cyber cell.",
                      severity="HIGH", node_ids=json.dumps(["suspect_vikram_bridge"]), anomaly_score=0.88, created_at=datetime.utcnow()),
                Alert(case_id="CASE-26189", alert_type="PREDICTED_HIDDEN_LINK", title="High Probability Link: Sanjay Singhal ↔ Imran @ Shooter",
                      description="Jaccard Link Predictor detected strong hidden link (score 0.72) between Hawala Mastermind Sanjay Singhal and Logistics Head Imran via 3 shared intermediary brokers.",
                      severity="HIGH", node_ids=json.dumps(["suspect_sanjay", "suspect_imran_logistics"]), anomaly_score=0.72, created_at=datetime.utcnow()),
                # CASE-26190 Alerts
                Alert(case_id="CASE-26190", alert_type="SIM_CLONING_SPIKE", title="Mass SIM Cloning Activity Detected in Mewat",
                      description="Over 150 cloned SIM cards traced to Nuh lab in 72-hour window. Deepfake voice calls impersonating police officers targeting elderly women.",
                      severity="CRITICAL", node_ids=json.dumps(["chk_ringleader_farhan", "chk_sim_factory"]), anomaly_score=0.94, created_at=datetime.utcnow()),
                Alert(case_id="CASE-26190", alert_type="DEEPFAKE_VOICE_PATTERN", title="AI Voice Deepfake Pattern Identified",
                      description="Voice biometric analysis reveals synthesized speech patterns in 200+ scam calls matching single AI model signature.",
                      severity="HIGH", node_ids=json.dumps(["chk_deepfake_tech"]), anomaly_score=0.89, created_at=datetime.utcnow()),
                # CASE-26191 Alerts
                Alert(case_id="CASE-26191", alert_type="CRYPTO_LAUNDERING_SPIKE", title="Large Monero Transaction Cluster Detected",
                      description="42.5 BTC equivalent converted to Monero through TorMix tumbling service in 48-hour window. Source traced to BazaarX marketplace.",
                      severity="CRITICAL", node_ids=json.dumps(["saf_mastermind_arjun", "saf_wallet_cold"]), anomaly_score=0.93, created_at=datetime.utcnow()),
                Alert(case_id="CASE-26191", alert_type="DARKWEB_LISTING", title="Stolen Aadhaar-PAN Dataset Listed on BazaarX",
                      description="50,000 Aadhaar-PAN pairs targeting women-owned businesses listed for sale on dark web marketplace.",
                      severity="HIGH", node_ids=json.dumps(["saf_darkweb_admin"]), anomaly_score=0.87, created_at=datetime.utcnow()),
                # CASE-26192 Alerts
                Alert(case_id="CASE-26192", alert_type="TRAFFICKING_MOVEMENT", title="Suspicious Interstate Vehicle Movement Pattern",
                      description="Vehicle BR01AK5566 completed 12 round trips on Bihar-Delhi corridor in 30 days. Each trip coincides with missing person reports.",
                      severity="CRITICAL", node_ids=json.dumps(["tri_transporter_mohan", "tri_vehicle_bus"]), anomaly_score=0.95, created_at=datetime.utcnow()),
                Alert(case_id="CASE-26192", alert_type="VICTIM_RESCUE_LEAD", title="Rescued Victim Identifies Network Recruiter",
                      description="Two rescued victims independently identified Sunita Devi as the recruiter who lured them from Bihar villages.",
                      severity="HIGH", node_ids=json.dumps(["tri_recruiter_sunita"]), anomaly_score=0.91, created_at=datetime.utcnow()),
                # CASE-26193 Alerts
                Alert(case_id="CASE-26193", alert_type="DRUG_CACHE_MOVEMENT", title="Unusual Vehicle Activity at Desert Cache Point",
                      description="GPS data shows 14 visits to isolated Thar desert location by courier vehicle. Pattern matches known drug drop operations.",
                      severity="HIGH", node_ids=json.dumps(["gar_courier_jeet", "gar_hideout_thar"]), anomaly_score=0.88, created_at=datetime.utcnow()),
                # CASE-26194 Alerts
                Alert(case_id="CASE-26194", alert_type="IDENTITY_FRAUD_MASS", title="217 Fake Aadhaar-Linked Bank Accounts Detected",
                      description="Pattern analysis identified 217 bank accounts opened using fraudulent Aadhaar numbers from compromised enrollment center.",
                      severity="CRITICAL", node_ids=json.dumps(["shd_mastermind_nikhil", "shd_mule_network"]), anomaly_score=0.92, created_at=datetime.utcnow()),
                # CASE-26195 Alerts
                Alert(case_id="CASE-26195", alert_type="DEEPFAKE_EXTORTION", title="Deepfake CBI Arrest Warrant Scam Campaign Active",
                      description="120+ women entrepreneurs received fabricated video calls from fake CBI/ED officers using deepfake technology.",
                      severity="CRITICAL", node_ids=json.dumps(["thd_deepfake_op", "thd_victim_women_biz"]), anomaly_score=0.93, created_at=datetime.utcnow()),
                # CASE-26196 Alerts
                Alert(case_id="CASE-26196", alert_type="SMUGGLING_PATTERN", title="Container Clearance Anomaly at Mundra Port",
                      description="40 containers cleared by same customs officer with mislabeled manifests. Value discrepancy of ₹12 Cr identified.",
                      severity="HIGH", node_ids=json.dumps(["nep_customs_corrupt", "nep_container_id"]), anomaly_score=0.86, created_at=datetime.utcnow()),
                # CASE-26197 Alerts
                Alert(case_id="CASE-26197", alert_type="SHELL_COMPANY_NETWORK", title="Multi-Layered Shell Company Money Trail Detected",
                      description="₹41 Cr traced through 3-layer shell company structure from infrastructure kickbacks to offshore Singapore trust.",
                      severity="HIGH", node_ids=json.dumps(["fal_politician", "fal_shell_1", "fal_offshore"]), anomaly_score=0.85, created_at=datetime.utcnow()),
                # CASE-26198 Alerts
                Alert(case_id="CASE-26198", alert_type="CYBERSTALKING_CAMPAIGN", title="Coordinated Deepfake & Doxxing Campaign Against Women Journalists",
                      description="34 women journalists targeted with deepfake content and personal data leaked via automated Telegram bot. 2,500 bot accounts amplify harassment.",
                      severity="CRITICAL", node_ids=json.dumps(["vip_mastermind_rohit", "vip_victim_journalist"]), anomaly_score=0.96, created_at=datetime.utcnow()),
                Alert(case_id="CASE-26198", alert_type="BOT_ARMY_DETECTED", title="Large-Scale Bot Army Coordinated Harassment",
                      description="2,500 Twitter/X bot accounts identified sending 50,000+ abusive messages. All accounts created within 72-hour window.",
                      severity="HIGH", node_ids=json.dumps(["vip_bot_army"]), anomaly_score=0.90, created_at=datetime.utcnow()),
            ]
            db.add_all(all_alerts)
            db.commit()
            print(f"[+] Seeded {len(all_alerts)} Intelligence Alerts Across All Cases")

        # ════════════════════════════════════════════════════════════════
        # FINAL SUMMARY
        # ════════════════════════════════════════════════════════════════
        total_nodes = db.query(GraphNode).count()
        total_edges = db.query(GraphEdge).count()
        total_cases = db.query(Case).count()
        total_alerts = db.query(Alert).count()

        print(f"\n{'='*60}")
        print(f" NETRA SYNTHETIC DATASET SEEDED SUCCESSFULLY (100% FREE TIER)")
        print(f" Cases: {total_cases} | Nodes: {total_nodes} | Edges: {total_edges} | Alerts: {total_alerts}")
        print(f" Credentials: investigator@netra.gov.in / Netra@2026")
        print(f"{'='*60}\n")
        
    finally:
        db.close()


import hashlib

def _generate_edge_evidence(eid: str, case_id: str, src: str, tgt: str, rel: str, ev_type: str, justif: str, conf: float):
    """Generates complete courtroom-admissible forensic evidence records for a graph edge."""
    seed_int = int(hashlib.md5(f"{eid}_{src}_{tgt}_{rel}".encode()).hexdigest(), 16)
    
    is_finance = any(k in rel.upper() for k in ["TRANSFER", "FUND", "SETTLE", "ESCROW", "CASH", "DIRECTOR", "MULE", "PAYOUT", "CRYPTO", "PURCHASE", "ACCOUNT"])
    is_telecom = any(k in rel.upper() or k in ev_type.upper() for k in ["CDR", "COMMUNICAT", "SUBSCRIBER", "CALL", "SIM", "VOIP", "WHATSAPP", "SIGNAL", "COORDINAT"])
    
    table_name = "financial_txns" if is_finance else ("cdr_logs" if is_telecom else ("telecom_kyc" if "KYC" in ev_type else "forensic_seizures"))
    rec_id = f"REC-{case_id}-{eid.upper()}"
    db_loc = {
        "table": table_name,
        "record_id": rec_id,
        "partition": f"{case_id.lower()}_primary_store",
        "storage_uri": f"sqlite:///netra.db#{table_name}/{rec_id}"
    }
    rep_id = f"NCRB-CFSL-2026-{(seed_int % 8999) + 1000}"
    sec_65b_hash = hashlib.sha256(f"{eid}:{case_id}:{src}:{tgt}:{rel}:{conf}".encode()).hexdigest()
    
    # Official FIR Records
    fir_list = [
        {
            "fir_no": f"FIR-{(seed_int % 400) + 100}/2026-NCRB-MHA",
            "police_station": "Special Cyber Police Station, Mandir Marg, New Delhi",
            "sections": "IPC 420 (Cheating), 384 (Extortion), 120B (Criminal Conspiracy) | IT Act Sec 66D | BNS 318(4)",
            "date": "2026-01-14",
            "status": "Charge Sheet Annexure A Filed",
            "db_ref": f"fir_repository:FIR-{(seed_int % 400) + 100}-DEL",
            "investigating_officer": "Inspector Ananya Sen (WSD-DL-412)"
        }
    ]
    
    # Financial Transaction Records
    txns = []
    if is_finance or conf >= 0.85:
        amt = ((seed_int % 40) + 5) * 50000  # ₹2.5L to ₹22.5L
        txns.append({
            "utr": f"UTR-SBIN2026{(seed_int % 899999) + 100000}",
            "sender": src.replace("_", " ").title(),
            "sender_acc": f"XXXX-{(seed_int % 8999) + 1000}",
            "receiver": tgt.replace("_", " ").title(),
            "receiver_acc": f"XXXX-{((seed_int * 7) % 8999) + 1000}",
            "amount_inr": amt,
            "formatted_amount": f"₹{amt:,.0f}",
            "timestamp": f"2026-02-{((seed_int % 20) + 1):02d} {((seed_int % 12) + 9):02d}:{((seed_int % 50) + 10):02d}:00 IST",
            "bank": "SBI -> HDFC Commercial",
            "type": "RTGS Hawala Layering" if "HAWALA" in justif.upper() else "Mule Inter-Bank Settlement",
            "suspicious_flags": ["Structuring below ₹20L reporting threshold", "Rapid onward transit"],
            "db_ref": f"financial_txns:TXN-RTGS-{(seed_int % 89999) + 10000}"
        })
        
    # CDR Call Detail Records
    cdrs = []
    towers = [
        {"id": "DEL-AIR-TWR-8841", "name": "Connaught Place Sector 4, New Delhi", "lat": 28.6328, "lon": 77.2197},
        {"id": "GGN-JIO-TWR-4412", "name": "Cyber Hub Phase 2, Gurugram", "lat": 28.4595, "lon": 77.0266},
        {"id": "NUH-VOD-TWR-0194", "name": "Nuh Safehouse Cluster, Mewat", "lat": 27.9944, "lon": 77.0460},
        {"id": "NOI-AIR-TWR-9921", "name": "Sector 63 Safehouse Drop Point, Noida", "lat": 28.6189, "lon": 77.3810}
    ]
    t = towers[seed_int % len(towers)]
    cdrs.append({
        "call_id": f"CDR-2026-{(seed_int % 89999) + 10000}",
        "caller": f"+9198110{((seed_int % 89999) + 10000):05d}",
        "receiver": f"+9199102{(((seed_int * 3) % 89999) + 10000):05d}",
        "timestamp": f"2026-02-{((seed_int % 20) + 1):02d} {((seed_int % 14) + 10):02d}:{((seed_int % 50) + 10):02d}:15 IST",
        "duration_sec": (seed_int % 550) + 45,
        "call_type": "VoIP / Encrypted Audio" if "VOIP" in justif.upper() or "SIGNAL" in justif.upper() else "Voice Call",
        "tower_id": t["id"],
        "tower_location": f"{t['name']} ({t['lat']}, {t['lon']})",
        "azimuth": (seed_int % 360),
        "imei": f"8671920394{((seed_int % 89999) + 10000):05d}",
        "db_ref": f"cdr_logs:CDR-{(seed_int % 89999) + 10000}"
    })

    return {
        "report_id": rep_id,
        "db_location": db_loc,
        "fir_records": fir_list,
        "transaction_records": txns,
        "cdr_records": cdrs,
        "sec_65b_hash": sec_65b_hash,
        "forensic_summary": justif,
        "seeded": True
    }


def _seed_nodes(db: Session, case_id: str, nodes_data: list):
    """Helper to seed graph nodes for a case with enriched evidence metadata."""
    for nd in nodes_data:
        props = dict(nd.get("properties", {}))
        seed_int = int(hashlib.md5(f"{case_id}_{nd['node_id']}".encode()).hexdigest(), 16)
        
        # Add DB location and Report ID to node properties
        props["report_id"] = f"NCRB-CFSL-2026-{(seed_int % 8999) + 1000}"
        props["db_location"] = {
            "table": "graph_nodes",
            "record_id": f"NODE-{case_id}-{nd['node_id'].upper()}",
            "partition": f"{case_id.lower()}_registry"
        }
        props["sec_65b_hash"] = hashlib.sha256(f"{case_id}:{nd['node_id']}".encode()).hexdigest()
        
        # Correlated transaction history for financial & person nodes
        txns = []
        if nd["entity_type"] in ["PERSON", "ORGANIZATION", "ACCOUNT"]:
            amt = ((seed_int % 30) + 3) * 50000
            txns.append({
                "utr": f"UTR-SBIN2026{(seed_int % 899999) + 100000}",
                "sender": nd["label"],
                "sender_acc": f"XXXX-{(seed_int % 8999) + 1000}",
                "receiver": "Syndicate Pooling Ledger",
                "receiver_acc": "XXXX-9920",
                "amount_inr": amt,
                "formatted_amount": f"₹{amt:,.0f}",
                "timestamp": f"2026-02-{((seed_int % 18) + 1):02d} 11:30:00 IST",
                "bank": "State Bank of India",
                "type": "Layered Transfer",
                "suspicious_flags": ["High-value transfer to unverified entity"],
                "db_ref": f"financial_txns:TXN-RTGS-{(seed_int % 89999) + 10000}"
            })
        props["transaction_records"] = txns
        
        # Correlated CDR call logs for persons and phones
        cdrs = []
        if nd["entity_type"] in ["PERSON", "PHONE"]:
            cdrs.append({
                "call_id": f"CDR-2026-{(seed_int % 89999) + 10000}",
                "caller": nd.get("phone") or f"+9198110{((seed_int % 89999) + 10000):05d}",
                "receiver": "+919910238475",
                "timestamp": f"2026-02-{((seed_int % 18) + 1):02d} 22:15:00 IST",
                "duration_sec": (seed_int % 400) + 60,
                "call_type": "VoIP / Encrypted Voice",
                "tower_id": "DEL-AIR-TWR-8841",
                "tower_location": "Connaught Place Sector 4, New Delhi (28.6328, 77.2197)",
                "azimuth": 120,
                "imei": f"8671920394{((seed_int % 89999) + 10000):05d}",
                "db_ref": f"cdr_logs:CDR-{(seed_int % 89999) + 10000}"
            })
        props["cdr_records"] = cdrs

        node = GraphNode(
            case_id=case_id,
            node_id=nd["node_id"],
            label=nd["label"],
            entity_type=nd["entity_type"],
            aliases=json.dumps(nd.get("aliases", [])),
            phone=nd.get("phone"),
            vehicle_plate=nd.get("vehicle_plate"),
            latitude=nd.get("latitude"),
            longitude=nd.get("longitude"),
            properties=json.dumps(props),
            is_synthetic=True,
            created_at=datetime.utcnow()
        )
        db.add(node)
    db.commit()
    print(f"[+] Seeded {len(nodes_data)} Nodes for {case_id} with Rich Evidence")


def _seed_edges(db: Session, case_id: str, edges_data: list):
    """Helper to seed graph edges for a case with enriched evidence metadata."""
    for eid, src, tgt, rel, ev_type, justif, conf, verd in edges_data:
        props = _generate_edge_evidence(eid, case_id, src, tgt, rel, ev_type, justif, conf)
        edge = GraphEdge(
            id=eid,
            case_id=case_id,
            source_id=src,
            target_id=tgt,
            relationship_type=rel,
            evidence_type=ev_type,
            justification=justif,
            confidence=conf,
            verdict=verd,
            properties=json.dumps(props),
            created_at=datetime.utcnow()
        )
        db.add(edge)
    db.commit()
    print(f"[+] Seeded {len(edges_data)} Edges for {case_id} with Court Evidence")


if __name__ == "__main__":
    seed_database()
