# AI Agent for Autism: Requirements Map and Prioritized Product Spec

## Executive summary

The product should be designed as a neurodiversity-affirming support agent, not as a diagnostic, therapeutic, or behavior-control system. Its strongest MVP wedge is a privacy-preserving coaching and communication assistant that supports social-skills rehearsal, AAC-adjacent expression, executive-function routines, and optional caregiver collaboration. Autism interventions span behavioral, developmental, educational, social-relational, pharmacological, psychological, and complementary approaches, and the CDC frames treatment as support for daily functioning and quality of life across home, school, community, and health settings ([CDC](https://www.cdc.gov/autism/treatment/index.html)). Social-relational supports such as social stories and structured social-skills groups are recognized as ways to practice social skills, while speech-language therapy and AAC can support users who communicate through speech, signs, gestures, pictures, or electronic communication devices ([CDC](https://www.cdc.gov/autism/treatment/index.html), [ASHA](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)).

The product should avoid promising that AI can reliably “read emotions.” Emotion-recognition tools may be useful as practice aids, but automated inference from faces, voice, or physiology should be framed as low-confidence cue detection with user confirmation. A 2024 systematic review of emotion-recognition systems for autism found that studies most often used facial-expression techniques and cameras, noted increased use of physiological sensors, and reported that privacy or security issues were seldom addressed in sufficient detail ([International Journal of Medical Informatics](https://linkinghub.elsevier.com/retrieve/pii/S1386505624001321)). Wearable stress-detection research also points to real potential but significant constraints: autistic users may have sensory sensitivities, wristbands and watches appear more acceptable than many alternatives, physiological signals can be corrupted by motion or stimming, stress thresholds may need personalization, and long-term real-world validation is limited ([PMC review on wearable stress monitoring](https://pmc.ncbi.nlm.nih.gov/articles/PMC11679670/)).

The product’s trust model should be privacy-first from day one. Health-adjacent data, child voice data, transcripts, AAC vocabulary, routines, and caregiver notes are sensitive even when the app is not legally classified as a medical device or HIPAA-covered service. The FTC recommends health apps minimize collection, limit permissions, use privacy-protective defaults, obtain affirmative express consent for sensitive health data collection or sharing, and give just-in-time notice when unexpected or sensitive data is collected ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)). COPPA treats a child’s voice recording as personal information when an app is directed to children under 13, and the FTC’s limited voice-command enforcement policy applies only when audio is collected solely to replace written words, held briefly, used only for that purpose, and disclosed clearly in the privacy policy ([FTC COPPA voice guidance](https://www.ftc.gov/news-events/news/press-releases/2017/10/ftc-provides-additional-guidance-coppa-voice-recordings)).

## Product framing

### Working product concept

The product is an AI support companion for autistic users and their trusted support network. It helps users prepare for social situations, express needs and feelings, plan tasks, review conversations or appointments, and optionally connect routines to wearable signals. It should emphasize user agency, sensory safety, consent, and transparent uncertainty. The product should be usable by autistic children, teens, and adults, but the MVP should pick one initial user segment to avoid unsafe generalization across age, language, communication style, motor profile, and support needs.

### Recommended MVP segment

The recommended MVP segment is autistic teens and young adults who can use a smartphone or tablet with some independence and who want help with daily planning, social rehearsal, communication repair, and self-advocacy. Mobile technology interventions for autistic people show more consistent promise in older participants, practical real-life skills, daily-life materials, and in-session training, while evidence for younger children is more mixed and the trial base remains small ([JMIR Mental Health](https://mental.jmir.org/2021/9/e20892)). Starting with teens and adults also reduces some child-specific compliance complexity while still supporting caregiver, coach, therapist, or school-staff collaboration when users opt in.

### Product principles

- **Neurodiversity-affirming support**: The product should help users communicate preferences, regulate demands, prepare for context, and advocate for themselves rather than training them to mask, suppress stimming, or conform to neurotypical behavior norms. Social-relational autism supports are framed around building social skills and emotional bonds, and some approaches involve parents or peer mentors rather than one-way correction ([CDC](https://www.cdc.gov/autism/treatment/index.html)).
- **Multimodal communication by default**: AAC practice should support gestures, signs, pictures, text, voice output, visual schedules, and custom vocabulary rather than assuming speech as the only successful output. ASHA describes AAC as involving manual signs, gestures, tangible objects, pictures, boards, letter boards, speech-generating devices, and other modalities, and notes that users may combine modalities depending on context, audience, and communicative intent ([ASHA](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)).
- **Assistive, not clinical authority**: The agent may support routines, reflection, practice, and communication, but it should not diagnose autism, prescribe treatment, replace speech-language pathologists or clinicians, or make crisis determinations. The CDC notes that autism treatments are often delivered across education, health, community, and home settings, and that individuals, families, and doctors should work together when monitoring medication or health-related interventions ([CDC](https://www.cdc.gov/autism/treatment/index.html)).
- **Privacy and safety as core UX**: Privacy should be visible in the main product experience, not hidden in legal text. FTC health-app guidance recommends privacy-protective defaults, limiting permissions to what the product really needs, just-in-time notice for sensitive collection, and clear explanations of what data is collected and why ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).
- **AI uncertainty is explicit**: Any model output that infers intent, emotion, stress, or risk should display uncertainty and ask for confirmation. NIST’s AI Risk Management Framework treats valid and reliable performance as foundational to trustworthy AI and calls for documenting limits of generalizability, safety risks, privacy risks, transparency risks, and fairness risks across the AI lifecycle ([NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)).

## Requirements map

| Capability area | User need | Core requirements | Data used | Safety and privacy requirements | MVP priority |
| --- | --- | --- | --- | --- | --- |
| Social-skills practice | Practice common interactions before they happen and review them afterward. | Scenario builder, role-play agent, social story generator, difficulty controls, debrief summaries, self-advocacy scripts, option to practice repair phrases. | User-entered scenario, optional transcript, profile preferences, past saved scripts. | No “normality score,” no masking goals, no hidden training on user conversations, user-editable scripts, caregiver sharing only by explicit consent. | P0 |
| Emotion-recognition practice | Learn to identify possible emotional cues in low-stakes examples without treating AI inference as truth. | Practice cards, situational context prompts, “what else could this mean?” alternatives, user-confirmed labels, confidence display. | Curated images or generated scenarios, user answers, optional private practice history. | No covert camera analysis in MVP, no definitive emotion labels, no third-party face analysis for real people without consent. | P1 |
| AAC support | Express needs, choices, feelings, boundaries, and repair messages quickly. | Custom phrase bank, visual tiles, text-to-speech, core/fringe vocabulary, context boards, “something is wrong” quick access, export/share with SLP or caregiver. | User-created vocabulary, symbols, preferred voice, access preferences, language settings. | User owns vocabulary, no ad targeting, local-first quick phrases, protected sharing, audit log for caregiver edits. | P0 |
| Executive-function help | Break down tasks, transition between activities, manage appointments, and reduce planning load. | Visual schedules, step breakdowns, timers, transition warnings, checklists, routine templates, “body doubling” mode, calendar import, low-demand reset. | Tasks, routines, calendar events, notification preferences, optional caregiver suggestions. | Predictable interaction, quiet mode, no punitive streaks, notifications under user control, clear undo. | P0 |
| Wearable data | Notice possible stress, sleep, or activity patterns without overclaiming causation. | Optional wearable connection, trend view, personalized baseline, “possible overload” alerts, manual tagging, caregiver alert rules. | Heart rate, HRV, sleep, activity, EDA where available, user tags. | Opt-in by data category, default off, confidence and uncertainty display, no emergency claims, sensory-friendly device guidance. | P1 |
| Transcription | Capture meetings, therapy sessions, school conversations, or self-reflections for review and communication repair. | Live or uploaded transcription, speaker labels, summaries, action items, “what did they ask me to do?” extraction, communication repair drafts. | Audio, transcript, speaker labels, generated summary. | Consent workflow, child voice rules, short retention options, deletion controls, transcript redaction, no recording without clear indicator. | P0 |
| Caregiver and professional collaboration | Share the right information with trusted people without losing user agency. | Role-based sharing, caregiver suggestions, SLP/coach export, support plan, crisis contacts, collaborative routine templates. | Shared scripts, routines, AAC boards, selected trend summaries, notes. | User-controlled sharing for adults, guardian workflows for minors, least-privilege roles, visible access logs. | P1 |
| Personalization and accessibility | Make the agent work for varied sensory, communication, language, and motor profiles. | Plain language mode, low-stimulation UI, predictable navigation, custom voice/tone, bilingual support, icon size, text size, reduced motion, switch/keyboard support. | Accessibility settings, language preference, motor access preference, sensory preferences. | Settings portable across devices, no dark patterns, reversible defaults. | P0 |
| Privacy, security, and AI governance | Establish trust before collecting highly sensitive data. | Consent center, data map, retention controls, encryption, RBAC, audit logs, model-risk register, incident reporting, third-party review process. | Account data, consent records, processing logs, safety events. | Data minimization, privacy-protective defaults, de-identification policy, no secondary data use without opt-in, breach response. | P0 |

## Prioritized product spec

### Problem statement

Autistic users often need support that is contextual, multimodal, and available at the moment of need. Existing supports can be fragmented across therapy sessions, AAC tools, calendar apps, notes, caregivers, school systems, wearable dashboards, and transcription tools. The result is a high coordination burden for users and families, especially when a user needs to prepare for a social situation, express a need quickly, remember a plan, or understand what happened in a conversation.

The product opportunity is to combine social rehearsal, communication support, executive-function scaffolding, transcription, and optional wearable trends into one consent-aware agent. This must be done carefully because the data involved can reveal disability status, communication patterns, routines, locations, voice recordings, stress patterns, and family or school relationships. The FTC specifically advises health apps to collect only what they need, limit permissions, use privacy-protective defaults, use strong encryption, and obtain affirmative express consent before collecting or sharing sensitive health data ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).

### Personas

- **Autistic teen or young adult**: Wants help preparing for social situations, remembering next steps, communicating needs, and recovering after confusing or stressful interactions.
- **Autistic AAC user**: Uses speech, text, symbols, gestures, signs, or speech-generating tools and needs fast access to meaningful vocabulary across contexts.
- **Caregiver or parent**: Wants to support routines, communication, and transitions without overriding the user’s autonomy.
- **Speech-language pathologist, coach, therapist, teacher, or job-support professional**: Wants structured exports, goal-aligned practice materials, and collaboration artifacts without becoming dependent on black-box AI.
- **Privacy/security administrator**: Needs to understand what sensitive data exists, where it flows, who can access it, how long it is retained, and how AI model risk is governed.

### Goals

- **User activation**: At least 70% of MVP users create one routine, one communication phrase bank, and one social-practice scenario during onboarding.
- **Task completion**: At least 75% of initiated executive-function sessions produce a completed checklist, saved routine, or scheduled reminder.
- **Communication usefulness**: At least 60% of AAC or quick-expression users reuse or edit a saved phrase within 14 days, indicating that the phrase bank remains relevant.
- **Trust and control**: At least 90% of users can find data deletion, sharing, and recording controls during usability testing without support.
- **Safety quality**: Fewer than 1% of AI responses in test conversations should contain prohibited claims such as diagnosis, definitive emotion reading, punishment guidance, or advice to ignore professional care.

### Non-goals

- **Diagnosis or clinical assessment**: The product will not diagnose autism, grade autistic traits, assess severity, or replace a clinician.
- **Behavior compliance system**: The product will not score “normal” behavior, suppress stimming, enforce eye contact, or optimize for masking.
- **Emergency response device**: Wearable alerts and transcript summaries will not be marketed as emergency detection, crisis prediction, or medical monitoring.
- **General-purpose emotion surveillance**: The MVP will not analyze real-time camera feeds of other people to label their emotions.
- **Unsupervised child social network**: The product will not allow minors to interact with unknown people or unmoderated peer communities.

## P0 requirements

### P0: Consent, privacy, and data governance foundation

**Requirement**: The product must provide a consent center that explains, in plain language, which data types are collected, why they are collected, who can see them, how long they are retained, and how to delete or export them. FTC health-app guidance recommends simple and direct communication, just-in-time notice for sensitive or unexpected collection, privacy-protective defaults, and affirmative express consent before collecting or sharing sensitive health data ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).

**Acceptance criteria**

- Given a new user has not opted into transcription, when they tap “Record,” then the app explains audio collection, transcript generation, retention, and sharing before recording begins.
- Given a user turns off wearable data access, when the next sync runs, then no wearable data is fetched and the disabled status is visible in the consent center.
- Given a user requests deletion, when the deletion completes, then the app confirms which data classes were deleted and which legally required records, if any, were retained.
- Given a child under 13 is in scope, when voice recording is enabled, then the product requires a COPPA-compliant parental consent path unless collection is limited to brief voice-command replacement and meets the FTC’s narrow conditions.

**Dependencies**: Legal review, data inventory, consent event store, retention scheduler, privacy-policy generation workflow, data-subject request workflow.

### P0: Neurodiversity-affirming onboarding and accessibility profile

**Requirement**: Onboarding must capture communication preferences, sensory preferences, interaction style, language preference, support people, and accessibility needs without forcing a deficit-based profile. W3C notes that cognitive and learning disabilities can affect perception, memory, language, attention, problem solving, and comprehension, and that technology can let users access information in text, audio, or other formats and change presentation to match needs ([W3C WAI cognitive accessibility](https://www.w3.org/WAI/cognitive/)).

**Acceptance criteria**

- Given a user chooses “low stimulation,” when they enter the app, then reduced motion, muted colors, quiet sounds, and fewer simultaneous prompts are enabled.
- Given a user chooses Portuguese and English, when they create AAC phrases or routines, then the app supports bilingual labels and voice output.
- Given a user skips onboarding questions, when they reach the home screen, then all defaults remain privacy-protective and editable.
- Given a user changes accessibility settings, when they open any core feature, then the feature respects the updated settings.

**Dependencies**: Accessibility settings service, design system, localization framework, text-to-speech provider, input-device support.

### P0: Social-skills practice and social stories

**Requirement**: The agent must help users rehearse upcoming interactions through editable scenarios, role-play, social stories, debriefs, and self-advocacy scripts. CDC describes social-relational approaches as focusing on improving social skills and emotional bonds, and lists social stories and social-skills groups as structured ways to practice social situations ([CDC](https://www.cdc.gov/autism/treatment/index.html)).

**Acceptance criteria**

- Given a user enters “I need to ask my manager for a schedule change,” when they request practice, then the agent generates a role-play with user-editable goals, context, and preferred tone.
- Given the user selects “direct and low-pressure,” when the agent responds in role-play, then prompts stay concise and avoid sarcasm unless the user opts into advanced difficulty.
- Given the role-play ends, when the user asks for a summary, then the agent returns possible phrases, next steps, and “what to try differently” without scoring normality.
- Given a user says “I don’t want to make eye contact,” when generating practice guidance, then the agent suggests alternative attention and self-advocacy strategies rather than requiring eye contact.

**Dependencies**: Scenario templates, safety policy, personalization profile, LLM response evaluator, saved scripts database.

### P0: AAC-adjacent quick-expression system

**Requirement**: The app must provide fast, customizable expression tools for needs, choices, boundaries, feelings, and repair messages using text, symbols, and speech output. ASHA states that AAC can include unaided modes, low-tech/light-tech aids, and high-tech aids, and that well-designed AAC systems should be flexible, adaptable, personalized, and support changes in vocabulary and access method over time ([ASHA](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)).

**Acceptance criteria**

- Given a user opens quick expression, when they tap “Something is wrong,” then the app presents customizable follow-up options such as pain, sensory overload, confusion, need a break, or not sure.
- Given a user creates a phrase, when they save it, then they can choose text, icon, voice, language, and whether it appears in emergency, home, school, work, or social contexts.
- Given a caregiver has edit access, when they modify a phrase bank, then the app logs the change and makes the change visible to the user or guardian according to account type.
- Given a phrase is used frequently, when the user reviews suggestions, then the app can recommend making it easier to access without auto-changing the board.

**Dependencies**: Symbol library, text-to-speech, phrase database, role-based permissions, audit logs, optional SLP export.

### P0: Executive-function routines and transition support

**Requirement**: The agent must convert goals into visual steps, reminders, timers, transition warnings, and routine templates. Executive-function supports should avoid shame and punitive streak mechanics, and should provide low-demand recovery paths when a plan fails.

**Acceptance criteria**

- Given a user enters “get ready for work,” when they ask for a routine, then the agent creates ordered steps, optional time estimates, supplies needed, and a transition buffer.
- Given a user misses a reminder, when they return, then the app offers “resume,” “simplify,” or “reschedule” rather than failure messaging.
- Given a calendar event starts in 30 minutes, when transition support is enabled, then the app sends a sensory-friendly warning with the user’s selected notification style.
- Given a task has more than seven steps, when the user has low-demand mode enabled, then the app groups steps into smaller phases.

**Dependencies**: Calendar integration, notification settings, routine templates, low-demand mode, offline cache.

### P0: Transcription with consent and communication repair

**Requirement**: The product must support consensual transcription for user-controlled contexts such as appointments, classes, job coaching, or self-reflection, then convert transcripts into summaries, action items, questions, and communication-repair scripts. COPPA voice rules must be handled carefully for minors because audio files containing a child’s voice are treated as personal information under COPPA, and the FTC’s limited non-enforcement position applies only to brief voice-command replacement under narrow conditions ([FTC COPPA voice guidance](https://www.ftc.gov/news-events/news/press-releases/2017/10/ftc-provides-additional-guidance-coppa-voice-recordings)).

**Acceptance criteria**

- Given a user starts recording, when the recording begins, then the app shows a visible recording indicator and an optional consent prompt script.
- Given a transcript is generated, when the user opens the review, then the app separates “what was said,” “what I need to do,” “questions to ask,” and “possible misunderstandings.”
- Given a user deletes an audio file, when deletion completes, then transcript-linked embeddings or derived audio features are also deleted unless separately retained by explicit consent.
- Given a minor account uses transcription, when the recording flow starts, then guardian consent, retention limits, and school/therapy context restrictions are enforced according to policy.

**Dependencies**: Speech-to-text provider, speaker diarization, redaction pipeline, consent prompts, retention scheduler, safety classifier.

### P0: AI safety and response policy

**Requirement**: The agent must refuse or redirect unsafe requests, disclose uncertainty, and avoid clinical, diagnostic, coercive, or surveillance claims. NIST recommends mapping AI system purposes and limitations, measuring safety and generalizability, documenting privacy and fairness risks, and implementing appeal, override, incident-response, and deactivation mechanisms for deployed AI systems ([NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)).

**Acceptance criteria**

- Given a user asks “Does my child have autism?” when the agent responds, then it explains that it cannot diagnose and suggests professional evaluation resources.
- Given a caregiver asks “How do I stop stimming?” when the agent responds, then it rejects suppression as a default goal and suggests understanding sensory needs, safety, and communication alternatives.
- Given the agent infers stress or emotion, when it displays the output, then it uses probabilistic language such as “possible,” “might,” or “based on the data you chose to share,” and asks for user confirmation.
- Given a harmful or inaccurate response is reported, when the safety workflow runs, then the incident is logged, reviewed, and used to update test cases.

**Dependencies**: Safety taxonomy, model-evaluation harness, incident queue, human review workflow, policy versioning.

## P1 requirements

### P1: Wearable trend support

**Requirement**: The product should optionally connect wearable data to help users notice patterns in sleep, activity, heart rate, HRV, EDA, or potential overload events. Wearable stress-monitoring research for autistic users highlights cardiac activity, PPG, ECG, HRV, EDA/GSR, skin temperature, accelerometers, and other signals, but also notes small samples, motion artifacts, individual variability, sensory tolerance issues, and limited long-term real-world validation ([PMC review on wearable stress monitoring](https://pmc.ncbi.nlm.nih.gov/articles/PMC11679670/)).

**Acceptance criteria**

- Given a user has not connected a wearable, when they open trends, then the app explains benefits, limits, and data categories without prompting for broad permissions.
- Given wearable alerts are enabled, when heart-rate or EDA patterns deviate from the user’s baseline, then the app suggests a check-in rather than declaring stress.
- Given the user tags an event as “crowded grocery store,” when reviewing the week, then the app can show correlations between tagged contexts and physiological trends with an uncertainty note.
- Given a wearable produces noisy data, when confidence is low, then the app suppresses alerts or labels them low confidence.

**Dependencies**: Wearable integrations, baseline engine, user tagging, trend visualization, confidence scoring, notification rules.

### P1: Emotion-recognition practice mode

**Requirement**: The product should offer emotion-recognition practice as a learning tool, not an automated truth engine. Meta-analytic evidence indicates autistic people may experience emotion-recognition difficulties across basic facial emotions, but task characteristics and modalities matter, and product use should avoid turning deficits into surveillance or compliance scoring ([Neuroscience & Biobehavioral Reviews](https://linkinghub.elsevier.com/retrieve/pii/S0149763421005893)). Computerized and VR emotion-recognition training has shown a positive pooled effect in one meta-analysis, but the authors caution that small sample sizes and substantial heterogeneity mean results should be applied carefully ([Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/20473869.2022.2063656)).

**Acceptance criteria**

- Given a user practices emotion recognition, when an example is shown, then the app includes context, multiple possible interpretations, and an option to say “not enough information.”
- Given the user answers differently from the expected label, when feedback is shown, then it explains cues without marking the user as wrong in a stigmatizing way.
- Given a user wants to use their own photos, when upload begins, then the app requires consent confirmation for identifiable people.
- Given the product uses synthetic scenarios, when outputs are generated, then the app includes diversity across age, race, gender expression, communication style, and culture.

**Dependencies**: Curated content set, consent workflow for user media, bias review, accessibility review, model-output constraints.

### P1: Caregiver, SLP, coach, and educator collaboration

**Requirement**: The product should support role-based collaboration so trusted people can help configure routines, phrase banks, and practice materials. ASHA emphasizes involving individuals and family members in AAC decision-making, training communication partners, and collaborating with family, caregivers, educators, and interdisciplinary teams ([ASHA](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)).

**Acceptance criteria**

- Given an adult user invites a caregiver, when access is granted, then the caregiver receives only the selected permissions and cannot view private transcripts unless explicitly allowed.
- Given an SLP requests an AAC export, when the user approves, then the export includes phrase boards, usage notes, and user-stated goals without unrelated private logs.
- Given a caregiver suggests a routine change, when the user opens it, then they can accept, edit, decline, or mute future suggestions.
- Given a minor account is managed by a guardian, when sharing settings are changed, then the app records who changed them and when.

**Dependencies**: Roles and permissions, invite system, export templates, audit logs, guardian mode.

### P1: Context-aware debriefs and repair scripts

**Requirement**: The agent should help users review difficult interactions and create repair scripts such as “I think I misunderstood,” “Can you repeat the action item?” or “I need written instructions.” The feature should support social participation without implying that the autistic user is solely responsible for fixing communication breakdowns.

**Acceptance criteria**

- Given a user pastes a confusing message, when they ask for help, then the agent summarizes possible meanings and suggests clarifying questions.
- Given a user marks an interaction as stressful, when the debrief starts, then the app offers a short mode before asking detailed questions.
- Given the agent suggests a repair message, when the user edits it, then the edited tone becomes a preference for future suggestions.
- Given a conversation involves harassment, bullying, or coercion, when detected, then the agent offers safety-oriented escalation options rather than social-performance coaching.

**Dependencies**: Conversation summarizer, tone preferences, safety classifier, saved message templates.

## P2 requirements

### P2: VR, AR, or embodied role-play extensions

**Requirement**: The product could later add immersive practice or avatar-based scenarios after core safety and privacy controls are proven. Reviews of VR and AR for autistic social-communication support report promising but heterogeneous evidence, with limitations around study quality, sample sizes, control groups, and long-term effectiveness ([SAGE systematic review](https://journals.sagepub.com/doi/10.1177/01626434251317984), [MDPI AR review](https://www.mdpi.com/2073-431X/12/10/215)).

**Acceptance criteria**

- Given a user enters immersive mode, when the session starts, then sensory intensity, audio, motion, and session length are adjustable.
- Given the user exits early, when the session ends, then the product does not treat the exit as failure.
- Given the system uses avatars, when scenarios are generated, then the app avoids stereotypes and provides diverse representation.

**Dependencies**: 3D/VR stack, comfort controls, content safety review, expanded evaluation.

### P2: Advanced multimodal emotion and stress modeling

**Requirement**: The product could later evaluate multimodal signals from user-approved wearable, voice, text, and interaction patterns. This should remain research-gated because emotion-recognition studies for autism often rely heavily on facial expression data, have gaps in privacy/security treatment, and need more diverse datasets and context-aware signals ([International Journal of Medical Informatics](https://linkinghub.elsevier.com/retrieve/pii/S1386505624001321), [IEEE systematic literature review](https://ieeexplore.ieee.org/document/10633593/)).

**Acceptance criteria**

- Given multimodal inference is enabled, when an output is shown, then the app displays which data categories contributed and lets the user disable each one.
- Given model performance differs by subgroup, when evaluation identifies disparity, then deployment is blocked or constrained until mitigations are validated.
- Given the model lacks confidence, when a user asks “am I stressed?” then it prompts self-report rather than answering definitively.

**Dependencies**: Multimodal model, subgroup evaluation dataset, privacy review, independent model audit, in-product explanations.

## AI, privacy, and safety architecture

### Data-class inventory

| Data class | Sensitivity | Default retention | Processing stance |
| --- | --- | --- | --- |
| Profile and accessibility preferences | High | Until account deletion | Required for personalization; exportable and editable. |
| AAC vocabulary and phrase boards | High | Until user deletion | User-owned; not used for model training without explicit opt-in. |
| Social-practice scenarios | Medium to high | User-selectable | Stored only when user saves; private by default. |
| Audio recordings | Very high | Short retention by default | Delete audio after transcription unless user opts to retain. |
| Transcripts and summaries | Very high | User-selectable | Redaction, deletion, and sharing controls required. |
| Wearable trends | Very high | Off by default; user-selectable | Category-level consent and baseline-only summaries preferred. |
| Caregiver/professional notes | High | User-selectable | Role-based access and audit logs required. |
| Safety incidents | High | Policy-defined | Minimize content capture; preserve enough for review and audit. |

### Model-risk controls

- **Governance**: Maintain an AI risk register, data map, model inventory, third-party processor list, and documented legal/regulatory review. NIST’s GOVERN function calls for policies, accountability structures, role clarity, workforce diversity/accessibility processes, and third-party risk procedures across the AI lifecycle ([NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)).
- **Mapping**: Document intended uses, users, deployment settings, knowledge limits, human oversight paths, and foreseeable harms before release. NIST’s MAP function calls for documenting intended purposes, context-specific laws and norms, AI task categories, knowledge limits, human oversight, and risks from third-party components ([NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)).
- **Measurement**: Test the agent on autism-specific safety cases, accessibility cases, privacy cases, hallucination cases, coercive-caregiver cases, and emotion-inference uncertainty cases. NIST’s MEASURE function calls for evaluating valid and reliable performance, safety, security and resilience, transparency and accountability, explainability, privacy, and fairness, including documentation of generalizability limits ([NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)).
- **Management**: Ship incident reporting, human review, kill switches for unsafe features, rollback, deactivation, and change-management processes. NIST’s MANAGE function calls for prioritizing risks, implementing response and recovery plans, monitoring third-party resources, and communicating incidents and errors to relevant actors ([NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)).

### Privacy safeguards

- **Data minimization**: Collect only the data needed for the selected feature, because the FTC notes that data not collected does not need to be secured and that retained data must be protected ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).
- **Least privilege**: Request OS permissions only when needed and only for the relevant feature, because the FTC recommends tailoring permissions to the level required for normal functioning ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).
- **Privacy-protective defaults**: Keep recording, wearable sync, caregiver sharing, and model-training reuse off by default, consistent with the FTC’s recommendation that apps choose privacy-protective defaults ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).
- **Security by design**: Use encryption in transit and at rest, secure authentication, RBAC, short-lived tokens, audit logging, vulnerability reporting, and security testing before launch, consistent with FTC recommendations for health-app developers ([FTC mobile health app guidance](https://www.ftc.gov/business-guidance/resources/mobile-health-app-developers-ftc-best-practices)).
- **Child voice handling**: Treat children’s voice recordings as COPPA-sensitive personal information and avoid retaining raw audio whenever possible, because the FTC states that audio files containing a child’s voice are personal information under COPPA ([FTC COPPA voice guidance](https://www.ftc.gov/news-events/news/press-releases/2017/10/ftc-provides-additional-guidance-coppa-voice-recordings)).
- **Health-app legal triage**: Run a formal applicability analysis for FTC Act, Health Breach Notification Rule, HIPAA, FD&C Act, COPPA, and 21st Century Cures/ONC information-blocking considerations, because HHS describes an interagency mobile health apps tool that helps developers understand which federal laws may apply based on app function, data, and services ([HHS mobile health app resources](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html)).

## MVP scope

### Included in MVP

- **Onboarding and accessibility profile**: Communication mode, sensory profile, language, tone, support people, notification style, and privacy defaults.
- **Social-practice workspace**: Role-play, social stories, self-advocacy scripts, debriefs, and saved scenarios.
- **AAC quick-expression workspace**: Phrase boards, visual tiles, “something is wrong,” “I need a break,” text-to-speech, custom voice settings, and export.
- **Executive-function routines**: Visual routines, checklists, timers, transition supports, calendar import, and low-demand recovery.
- **Consent-aware transcription**: Recording indicator, consent prompt, transcript, summary, action items, questions, deletion controls, and child-account restrictions.
- **Privacy and safety foundation**: Consent center, data deletion/export, role-based sharing, audit logs, model safety policy, and incident reporting.

### Excluded from MVP

- **Automated real-world emotion detection**: This is deferred because emotion-recognition systems for autism still face modality, privacy, diversity, and generalization issues ([International Journal of Medical Informatics](https://linkinghub.elsevier.com/retrieve/pii/S1386505624001321)).
- **Wearable-triggered caregiver alerts**: Basic wearable exploration can be P1, but automated alerts should wait for personalized baselines, confidence scoring, and sensory-tolerance research validation.
- **Clinical workflow billing or EHR integration**: This adds regulatory and operational complexity before the core user value is validated.
- **Public community features**: This creates moderation and safety complexity, especially for minors and vulnerable users.

## Success metrics

| Metric | Definition | Target | Evaluation window |
| --- | --- | --- | --- |
| Activation | User creates one routine, one phrase bank, and one social-practice scenario. | 70% of onboarded MVP users. | First 7 days. |
| Retention | User completes at least three support sessions in a week. | 45% week-four retention for active MVP cohort. | 4 weeks. |
| Communication reuse | User reuses or edits a saved phrase after first creation. | 60% within 14 days. | 14 days. |
| Routine completion | Started routines that end in complete, rescheduled, or simplified state. | 75% of started routines. | 30 days. |
| Transcript usefulness | User saves, exports, or creates an action item from transcript summary. | 50% of transcript sessions. | 30 days. |
| Privacy comprehension | Users can locate deletion, sharing, and recording controls in usability testing. | 90% without support. | Pre-launch and quarterly. |
| Safety defect rate | Unsafe response rate across autism-specific eval suite. | Less than 1% critical failures. | Every release. |
| Caregiver overreach reports | Adult users report unwanted caregiver access or edits. | Less than 2% of shared accounts. | Monthly. |

## Launch sequence

### Phase 0: Discovery and co-design

Recruit autistic teens, adults, AAC users, caregivers, SLPs, educators, and privacy/security reviewers. W3C’s cognitive-accessibility materials emphasize that technology can support different ways of navigating, accessing information, and changing presentation to individual needs, and its supplemental guidance highlights including users in design and testing activities ([W3C WAI cognitive accessibility](https://www.w3.org/WAI/cognitive/)).

### Phase 1: Private alpha

Build the P0 feature set without wearable data or automated emotion inference. Validate onboarding, accessibility settings, social-practice usefulness, AAC board customization, executive-function routines, transcription consent, and deletion controls. Use structured safety evaluations before every model or prompt release.

### Phase 2: Supervised beta

Add role-based caregiver/professional collaboration and limited exports. Validate adult-user autonomy controls, guardian flows for minors, SLP export usefulness, and audit-log clarity. Add only non-alerting wearable trend exploration for users who explicitly opt in.

### Phase 3: P1 expansion

Introduce wearable baseline trends and emotion-recognition practice mode as opt-in features with disclaimers, confidence indicators, and conservative defaults. Wearable stress-monitoring research suggests that thresholds should be customized because of high individual variability, and that real-world noise, motion artifacts, and limited long-term validation constrain interpretation ([PMC review on wearable stress monitoring](https://pmc.ncbi.nlm.nih.gov/articles/PMC11679670/)).

## Key open questions

| Question | Why it matters | Owner | Blocking? |
| --- | --- | --- | --- |
| Which initial user segment is primary: teens, adults, AAC users, or caregiver-supported children? | Product safety, UX, compliance, and evaluation differ substantially by age and communication profile. | PM + Research | Yes |
| Will the product be marketed as wellness, education, assistive technology, therapy support, or healthcare? | Claims affect regulatory risk, privacy obligations, and evidence requirements. | Legal + PM | Yes |
| Will raw audio be retained after transcription? | Audio retention materially increases privacy, security, and COPPA risk. | PM + Security + Legal | Yes |
| Can adults fully prevent caregiver access? | Autonomy and abuse-prevention requirements depend on strong user control. | PM + Trust & Safety | Yes |
| What model providers process user data? | Vendor terms, training use, data residency, and deletion obligations must be reviewed. | Security + Legal | Yes |
| What level of SLP or clinician involvement is required for AAC exports? | AAC abandonment risk is reduced through personalization, family involvement, communication-partner training, and ongoing modification ([ASHA](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)). | Clinical advisor + PM | No |
| Should wearable data be child-available at launch? | Wearable research points to sensory tolerance, motion artifacts, individualized thresholds, and privacy concerns, making child deployment higher risk ([PMC review on wearable stress monitoring](https://pmc.ncbi.nlm.nih.gov/articles/PMC11679670/)). | PM + Research + Legal | No |

## Product recommendation

Ship the first version as a trusted, consent-aware support assistant centered on social rehearsal, communication, executive-function routines, and transcription. Defer automated emotion recognition and wearable-triggered interventions until the product has strong consent flows, a safety evaluation harness, clear uncertainty communication, and real-world user testing. The highest-risk product failure would be building a surveillance or compliance tool disguised as support; the highest-value product outcome is giving autistic users more control over communication, planning, and self-advocacy while letting trusted supporters help only where the user allows.
