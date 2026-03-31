# HS_webApp

## Problem statement
 Young adults entering high school often face uncertainty about their future and a lack of personalized guidance. 
 They may feel overwhelmed by the multitude of career options and educational paths available, leading to frustration and indecision. 
 This can result in missed opportunities for personal growth and development, as well as a lack of confidence in their ability to 
 navigate the transition into adulthood.

- Basic question to be resolved
	**What tools exist to help a person entering high school match to the kind of studies and career that interests them most in an 
	AI empowered environment?**

## Value proposition

 > For young adults entering high school who are uncertain about their future and frustrated by a lack of personalized guidance, 
 our web platform serves as a one-stop hub connecting them to tailored career-building resources. Unlike traditional situations 
 where teens are limited by their immediate life circumstances, network or rely on guesswork, our platform actively matches individual 
 personalities and skill sets to actionable career paths. By consolidating these tools into a personal profile, every user walks away 
 with a directed, personalized career plan and the educational resources they need to confidently step into adulthood. 

 ## Tools
	- Mininmum Viable Product (MVP):

		- A form for users to input their 200-word free time description.
		- A section to display the generated "Personality Badge" and predicted pathway.
		- Social sharing buttons for platforms like Instagram, Twitter, and Facebook.

		*Front end:*
			- Vanilla javascript, HTML, and CSS for a simple, responsive user interface.
		*Back end:*
			- Supabase for user authentication and database management.

## App solution concept

*The 200-Word Personality "Pathway" Predictor*
- Problem Statement Wrap: Uses advanced Natural Language Processing (NLP) to predict study paths from standard student self-descriptions.
Narrow Scope: The user provides only one thing: a 200-word paragraph describing what they do in their free time.
- AI Empowerment: Uses the free tier of the Sentino Personality API (which uses GPT-powered NLP). 
The app sends the user’s text to Sentino, which returns Big Five and RIASEC scores.
- User Profile & Tracking: Supabase stores the 200-word input and the corresponding numerical personality profile returned by the API. 
The app maps the strongest personality trait to one of three generic high school study tracks 
(e.g., High Openness -> Arts & Sciences Track; High Conscientiousness -> Vocational/Business Track).
- Sharing Feature: Generates a simple, stylized "Personality Badge" graphic using the Canvas API. 
The badge displays the predicted "Pathway."
- Platforms: Social sharing buttons. The badge image is downloadable for image-based platforms.

## Future vision

	Future iteration:
		- looking into TDD for site (research Jest and Playwright)
		- possible expansion into react for frontend
		- Possible inclusion of Node.js backend from scratch, configuring an Angular workspace and TypeScript

	Other Considerations:
	- Holland Occupational Themes model to provide an instant academic/career starting point.
	- O*NET Interest Profiler Short Form (30 questions) and attempt to Integrates the O*NET Web Service API 
	- inclusion of final RIASEC scores (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
	- research "Holland Code Score," "Big Five O*NET Result," "BigFuture Career Quiz Top 3"
	- My Next Move & The O*NET Interest Profiler
	- CareerOneStop: GetMyFuture
	- BigFuture
	- 16 Career Clusters Framework