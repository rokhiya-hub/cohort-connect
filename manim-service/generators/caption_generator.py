from utils.prompt_parser import parse_prompt

CATEGORY_EMOJIS = {
    'hackathon': ['🚀', '💻', '⚡', '🏆', '🤖'],
    'internship': ['💼', '🎓', '🌟', '📋', '💡'],
    'placement': ['👔', '🏢', '🎯', '📈', '✨'],
    'exam': ['📚', '✏️', '🎓', '💪', '🧠'],
    'resource': ['📖', '💡', '🔗', '📌', '🎯'],
    'tech': ['⚙️', '🤖', '💻', '🔬', '🚀'],
    'event': ['🎉', '📅', '🌟', '👥', '🎊'],
    'general': ['✨', '🌟', '💫', '🎯', '🔥'],
}

CATEGORY_HASHTAGS = {
    'hackathon': ['#Hackathon', '#CodingChallenge', '#Innovation', '#Tech', '#BuildToWin', '#Developers'],
    'internship': ['#Internship', '#CareerOpportunity', '#StudentLife', '#LearningAndGrowth', '#FutureReady'],
    'placement': ['#PlacementDrive', '#CampusRecruitment', '#JobOpportunity', '#Hiring', '#CareerGoals', '#Placement'],
    'exam': ['#ExamPrep', '#StudyTime', '#Academic', '#ExamAlert', '#StudentCommunity'],
    'resource': ['#LearningResources', '#StudyMaterial', '#Education', '#Knowledge', '#FreeResources'],
    'tech': ['#Technology', '#AI', '#MachineLearning', '#Programming', '#TechCommunity', '#Innovation'],
    'event': ['#Event', '#Workshop', '#Seminar', '#Networking', '#Community', '#LetsConnect'],
    'general': ['#CohortConnect', '#StudentCommunity', '#Education', '#Opportunity', '#Growth'],
}

TEMPLATES = {
    'hackathon': (
        "{emoji1} {title} is HERE!\n\n"
        "Ready to showcase your coding skills? Join us for an epic hackathon experience! "
        "Build innovative solutions, collaborate with brilliant minds, and compete for amazing prizes.\n\n"
        "{details}"
        "{emoji2} Don't miss out — register now and bring your A-game!\n\n"
        "{hashtags}"
    ),
    'internship': (
        "{emoji1} Exciting Internship Opportunity — {title}!\n\n"
        "Take the next step in your career journey! This internship is your chance to gain "
        "real-world experience, learn from industry experts, and build your professional network.\n\n"
        "{details}"
        "{emoji2} Apply now and kickstart your career!\n\n"
        "{hashtags}"
    ),
    'placement': (
        "{emoji1} Campus Placement Alert — {title}!\n\n"
        "Your dream job could be just around the corner! "
        "This is a golden opportunity to kickstart your career with a leading organization.\n\n"
        "{details}"
        "{emoji2} Prepare well and give it your best shot!\n\n"
        "{hashtags}"
    ),
    'exam': (
        "{emoji1} Important Exam Notice — {title}\n\n"
        "Stay prepared and give your best! Remember, every question is an opportunity "
        "to demonstrate your knowledge. You've got this!\n\n"
        "{details}"
        "{emoji2} Good luck to all appearing candidates!\n\n"
        "{hashtags}"
    ),
    'general': (
        "{emoji1} {title}\n\n"
        "{details}"
        "{emoji2} Stay connected with Cohort Connect for more updates!\n\n"
        "{hashtags}"
    ),
}


def generate_caption(prompt: str) -> dict:
    parsed = parse_prompt(prompt)
    category = parsed['category']
    emojis = CATEGORY_EMOJIS.get(category, CATEGORY_EMOJIS['general'])
    hashtags = CATEGORY_HASHTAGS.get(category, CATEGORY_HASHTAGS['general'])
    hashtags += ['#CohortConnect', '#StudentCommunity']

    details = ''
    if parsed.get('date'):
        details += f"📅 Date: {parsed['date']}\n"
    if parsed.get('venue'):
        details += f"📍 Venue: {parsed['venue']}\n"
    if details:
        details += '\n'

    template = TEMPLATES.get(category, TEMPLATES['general'])
    caption = template.format(
        emoji1=emojis[0],
        emoji2=emojis[1],
        title=parsed['title'],
        details=details,
    )

    return {
        'caption': caption.strip(),
        'hashtags': hashtags[:8],
        'category': category,
    }
