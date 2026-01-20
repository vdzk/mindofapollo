# What is the mind of Apollo?
Mind of Apollo is an open-source, collaboratively edited website hosting a network of arguments.
+ What makes it different?
+ Who controls the tech?
+ Define "argument"



# Who controls the tech?
The code is open-source and freely available on (GitHub)[https://github.com/vdzk/mindofapollo] together with instructions on starting your own server. So, if there will be a group of people who are dissatisfied with the current leadership they can branch off easily.
+ Who controls the content?



# Who controls the content?
Entries are not owned by anyone, similar to how no one owns a Wikipedia article. Generally every editor can edit any entry. Practically anyone is free to be an editor, so long as they make an account and follow the rules. Some additional restrictions apply to recently created accounts.

As with the code, the live database dumps are also freely available and can be used to kick-start a separate branch.
+ Who determines the scoring rules?
+ Define "entry"



# What makes it different?
The arguments are scored, but not by a popular vote, judges or AI. How then? First, I need to explain how the arguments are organized.
+ How are the arguments organized?
+ How is this different from Wikipedia?
+ How is this different from Kialo?
+ How is this different from a typical debate (platform/society)?
+ Define "score"



# How are the arguments organized?
<!-- Image: "Argument structure" https://docs.google.com/drawings/d/14DLTloX6NnbL3AkZ6NM_7BNMt1XoOCgL2E7SlpXkWeo/edit?usp=sharing -->
Statement (S1) at the top is the main claim. It has a pro (A2) and a con (A1) arguments attached to it. These arguments rely on premises recorded as independent statements (S2, S3, S4). In turn, these statements have deeper arguments attached to them, and so on.
+ How does scoring work?
+ Define "statement"



# How does scoring work?
The website calculates the likelihood that the claim is true based on the strengths of arguments that are attached to it. The strength of an argument is calculated based on the likelihoods of the premises that it relies on. So the scores are calculated automatically all the way up from the very bottom layer of premises. If there is a significant disagreement between the editors about the likelihood of a bottom-level premise, more arguments and premises are added below it until an agreement is reached.
+ What value does this project add?
+ How are the scores calculated?
+ Which axioms lie at the bottom?
+ Define "likelihood"
+ Define "strength"
+ Define "score"
+ Define "premise"



# Can I trust these calculations?
The algorithm that derives scores is currently not very sophisticated and likely to result in issues like double-counting. In the future this will likely be refined, or if not, I will likely switch to a user-based scoring system that guides users to largely follow the algorithm in most cases.

At the moment the strength of an argument is determined simply by multiplying the likelihoods of its premises. You can get some intuition for how the argument scores are rolled up into statement scores by using [confidence calculator](https://mindofapollo.org/confidence-calculator).

For more details you can join [the discord](https://discord.gg/x23ycnckHN) or check out the [formulas in the source code](https://github.com/vdzk/mindofapollo/tree/main/src/calc).



# What value does this project add?
The cognitive resources unlocked by productive mass collaboration on this platform can be used to conduct conclusive investigations on questions that require pulling a lot of research and evidence together while avoiding mistakes in reasoning.
+ What is the goal of the project?



# What is the goal of the project?
If Apollo becomes capable of consistently rational, open and well-informed judgment, then it will gain public trust as it consistently makes good predictions. Many disagreements could be resolved by deferring to Apollo, ultimately resulting in much better-decision making on a large scale.
+ What should I explore next?



# What should I explore next?
Thank you for reading this introduction. Please find further details, clarifications and answers further down. If you find it interesting check out the platform at [mindofapollo.org](https://mindofapollo.org/) and join our [Discord](https://discord.gg/3hhhD4tK9h).



# Define "argument"
Some reasoning about fact(s) which supports a conclusion. Arguments are intended to either support (pro) or contest (con) the confidence of their parent statement. All arguments are made up of premises, which are statements.



# Define "axiom"
Epistemically unjustified assumption, common or uncommon.



# Define "confidence"
Same as likelihood.
+ Define "likelihood"


# Define "entry"
An argument, statement, definition etc. that an editor added to the website.



# Define "likelihood"
(in this context of the website) means "credence given the available data".

Example: A flipping coin will typically objectively be (near) determined by the laws of physics to land on one side (thus the objective probability will typically be at least close to 100% or 0%). But given our inability to accurately predict the physical interactions involved, our credence for it landing on one side would (and should) still ordinarily be near (or at) 50%.



# Define "premise"
When supporting an argument, a statement is called a "premise" but functions almost exactly the same.
+ Define "statement"



# Define "score"
The likelihood that a statement is true or the strength of an argument.
(likelihoods and strengths)
+ Define "likelihood"
+ Define "strength"



# Define "statement"
A claim about what is true/false.



# Define "strength"
Strength of an argument is the degree to which it changes the confidence in its conclusion.
+ Define "confidence"



# Which axioms lie at the bottom?
Currently, the site supports different users adopting different prescriptive axioms but not different descriptive ones.
+ Which descriptive axioms are supported?
+ Which prescriptive axioms are supported?
+ Define "axiom"
+ Define "descriptive"
+ Define "prescriptive"



# Which descriptive axioms are supported?
+ The law of identity
+ The law of contradiction
+ Modus ponens works
+ The straight rule
+ The semi-reliability of the site's reasoning.



# The law of identity
All well-defined things/propositions are equal to themselves. All reasoning relies on propositions being equal to themselves, otherwise they could be different from themselves at virtually any point, resulting in absurdity.



# The law of contradiction
No well-defined proposition can be both true and false. If the law of contradiction is rejected, practically anything can be proven using [the principle of explosion](https://en.wikipedia.org/wiki/Principle_of_explosion).



# Modus ponens works
If (if x then y) and x, then y.
Without presupposing modus ponens (or anything similar), it seems we are unable to engage in logical inference. Because if only the other axioms listed here are presupposed, then it seems like we are unable to justify modus ponens.



# The straight rule
If m out of n observed instances of a type A have been found to be B, then the probability that the next A will be a B is m/n.

Without presupposing something like this, it seems at the very least quite difficult to justify inductive inference. Approaches have been suggested and will be investigated, but for the time being we will act as though this is another axiom for the sake of a relatively solid axiom set.



# The semi-reliability of the site's reasoning.
i.e. The assumption that the site has the bare minimum requirements to reason consistently enough.

If this is denied, anything can be contested on the grounds that "the site's reasoning is unreliable", and any counterargument would implicitly be based on the assumption that the site is capable of semi-reliably performing at least the most basic operations (for such a counterargument to be remotely reliable). Thus, just as it is necessary (for general reasoning) for people to presuppose the semi-reliability of their own mental faculties (to avoid never trusting themselves because of believing their own minds are unreliable), it is also necessary for the scoring system to reflect a site-wide axiom that the site is at least capable of the bare minimum.




# Define "descriptive"
These statements describe how things are. They can be true or false, but they are not about what should be - only what is (or was, or will be).



# Define "prescriptive"
Statements about what someone should or should not do.




# Which prescriptive axioms are supported?
Users may create/select prescriptive "goods" (eg. well-being), and prescriptive "weight profiles" with different weights for the "goods".

Amounts of these values can then be tied to entries, which are then calculated using the selected moral profile to show the final prescriptive value of a given action.

This is meant to provide a relatively objective way to analyze prescriptive claims without forcing users to accept a particular value paradigm.

I plan to expand this system to (at the very least) be more intuitive for those who hold non-consequentialist views. But for the time being it seems possible to reduce other views to weight profiles by eg. placing no weight on consequentialist metrics, and some regard for eg. rule-based metrics.



# How is this different from Wikipedia?
Wikipedia is primarily a repository of knowledge. It lacks a built-in mechanism for systematic reasoning (eg. It has no scoring or argument graphing system).

As a result, for contentious matters it often presents a brief overview and some resources from multiple sides and then says nothing more about what's true.

The Mind of Apollo provides a mechanism for systematically reasoning about more contentious issues.



# How is this different from Kialo?
The primary function of Kialo is collecting arguments and letting readers form their independent opinions. It has a popular vote feature, but the voters are not even required to read any of the arguments to cast their vote, so it's of little significance.

In contrast, in the Mind of Apollo, the scores are derived automatically based on the whole argument structure below each claim. These scores are deeply justified, platform-wide conclusions rather than opinions of individual users that have questionable depth.
+ Why having a single score per claim / argument is important?



# Why having a single score per claim / argument is important?
The fact that a claim has a single score at any point in time, rather than per user, creates a strong point of contention. This in turn will motivate many editors to move this score in their direction. This requires finding flaws in the arguments of their opponents and strengthening the argument on their side. The Mind of Apollo platform provides guidance on how to do it in line with critical thinking standards and enforces those standards.

This continuous refinement of arguments will improve their persuasiveness and the accuracy of the platform's conclusions.
+ What are the editing guidelines?


# What are the editing guidelines?
Please open any of the arguments on the [platform](https://mindofapollo.org/) and explore its "How To" section. Depending on the argument type, you may get a combination of the general instructions and the argument type's specific instructions.



# How is this different from a typical debate (platform/society)?
Typical debate(r)s often struggle to keep track of all the important information. They have to contend with very limiting time constraints. Typical debates don't have many reasoners involved.
+ Advantage of roll-up scores
+ Advantage of canonically
+ Advantage in memory
+ Advantage in time available
+ Advantage in numbers



# Advantage of roll-up scores
In typical debates, unreliable intuitions must be relied on to calculate and combine confidences, giving our cognitive biases a huge opportunity to influence our thinking.

In Apollo, confidences are mathematically combined, leaving little room for such biases in score combination.




# Advantage of canonically
In typical debates and debate societies/platforms, past work is not often systematically saved and reused in future works, leading to lots of pointless repetition.

Apollo's statements are canonical, meaning it's intended that only one in-platform statement should exist for each concept trying to be described by that statement.

As such, if you (or anyone else) searches for a statement that you/they intend to make and it has already been made, it can be found and linked (along with indirectly all of its descendent entries) without any necessary repetition.




# Advantage in memory
In vocal debates, remembering all the important statements and arguments can quickly become quite difficult. This can easily result in unrecognized contradictions or conflations.

In text (and thus also in Apollo), all statements and arguments are saved and you can look back over them whenever you like.

An added bonus of Apollo is that the statements/arguments tend to be somewhat organized and sometimes tagged, making them quicker and easier to find in general.




# Advantage in time available
In Apollo, anyone with the free time can take as long as they want (and as many days as they want) to iron out all the important details they can think of.

Typical debates, whether between an informal group of people, or formally presented and moderated, are usually too short and rarely properly revisited. As such, there is typically far less than the required amount of work done to cover all the relevant and important points, to the final important level of detail.

It's typically harder to dive deep into a single point without seeming to change the subject in a counterproductive way, since there is so little time to cover everything.

There is generally insufficient time to thoroughly investigate sources during a vocal debate. Thus important sources are often left unused or unscrutinised.



# Advantage in numbers
Typical debates are 1v1 or sometimes small group vs small group, meaning there are often important nuances that are missed as a result of the limited knowledge/calculation of the participants (even if they are experts in the relevant subject(s)).

Mind of Apollo is open to almost everyone, meaning that the amount of available knowledge and human cognition the platform can potentially draw on for more important topics is much greater.
