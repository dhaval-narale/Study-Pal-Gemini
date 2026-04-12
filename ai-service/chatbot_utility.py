CHAPTERS = {
    "Biology": [
        "1. Reproduction in Organisms",
        "2. Sexual Reproduction in Flowering Plants",
        "3. Human Reproduction",
        "4. Reproductive Health",
        "5. Principles of Inheritance and Variation",
        "6. Evolution",
        "7. Human Health and Disease",
        "8. Strategies for Enhancement in Food Production",
        "9. Microbes in Human Welfare",
        "10. Biotechnology: Principles and Processes",
        "11. Biotechnology and its Applications",
        "12. Ecosystem",
        "13. Organisms and Populations",
        "14. Biodiversity and Conservation",
        "15. Environmental Issues",
    ],
    "Physics": [
        "1. Electric Charges and Fields",
        "2. Electrostatic Potential and Capacitance",
        "3. Current Electricity",
        "4. Moving Charges and Magnetism",
        "5. Magnetism and Matter",
        "6. Electromagnetic Induction",
        "7. Alternating Current",
        "8. Electromagnetic Waves",
        "9. Ray Optics and Optical Instruments",
        "10. Wave Optics",
        "11. Dual Nature of Radiation and Matter",
        "12. Atoms",
        "13. Nuclei",
        "14. Semiconductor Electronics",
    ],
    "Chemistry": [
        "1. The Solid State",
        "2. Solutions",
        "3. Electrochemistry",
        "4. Chemical Kinetics",
        "5. Surface Chemistry",
        "6. General Principles and Processes of Isolation of Elements",
        "7. The p-Block Elements",
        "8. The d and f Block Elements",
        "9. Coordination Compounds",
        "10. Haloalkanes and Haloarenes",
        "11. Alcohols, Phenols and Ethers",
        "12. Aldehydes, Ketones and Carboxylic Acids",
        "13. Amines",
        "14. Biomolecules",
        "15. Polymers",
        "16. Chemistry in Everyday Life",
    ],
    "Maths": [
        "1. Relations and Functions",
        "2. Inverse Trigonometric Functions",
        "3. Matrices",
        "4. Determinants",
        "5. Continuity and Differentiability",
        "6. Application of Derivatives",
        "7. Integrals",
        "8. Application of Integrals",
        "9. Differential Equations",
        "10. Vector Algebra",
        "11. Three Dimensional Geometry",
        "12. Linear Programming",
        "13. Probability",
    ],
}

RAG_CHAPTERS = {"6. Evolution", "12. Ecosystem"}


def get_chapter_list(subject: str):
    return CHAPTERS.get(subject, [])


def is_rag_available(chapter: str) -> bool:
    return chapter in RAG_CHAPTERS
