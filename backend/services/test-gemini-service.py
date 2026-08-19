from gemini_service import analyze_requirement

sample_text = """
The system should allow users to register for an account using their name, email, and password.
Users must be able to log in using their email and password. If the credentials are invalid,
an error message should be displayed. After five failed login attempts, the account should be
locked for 15 minutes.

Once logged in, users should be able to create requirement analysis requests by uploading a
document (PDF, Word, or plain text). The system should store each uploaded document along with
its extracted text, the AI-generated summary, and the analysis status (pending, processing,
completed, or failed).

Users should be able to view a history of their past analyses, see when each one was created,
and re-download the original uploaded file at any time.
"""

result = analyze_requirement(sample_text)

for table in result["dbTables"]:
    print(table["name"])
    print(table["attributes"])
    print()