-- Generated seed inserts

BEGIN;

INSERT INTO statement_type (id, name) VALUES
  (1, 'descriptive'),
  (2, 'threshold'),
  (3, 'prescriptive');

INSERT INTO argument_type (id, name) VALUES
  (1, 'authority'),
  (2, 'analogy'),
  (3, 'other'),
  (4, 'explanation'),
  (5, 'epistemic'),
  (6, 'deduction'),
  (7, 'extrapolation'),
  (8, 'example'),
  (9, 'obvious'),
  (10, 'pragmatic'),
  (11, 'induction'),
  (12, 'definition'),
  (13, 'causal'),
  (14, 'normative'),
  (15, 'contradiction'),
  (16, 'feasibility'),
  (17, 'statistical');

INSERT INTO auth_role (id, name) VALUES
  (1, 'admin'),
  (2, 'invited');

INSERT INTO translation (table_name, column_name, record_id, english, original_language) VALUES
  ('statement_type', 'description', 2, 'Statements about the probability of reaching a certain threshold based on a balance of factors. For example probability of a person making a decision based on weighing its pros and cons.', 'english'),
  ('argument_type', 'description', 8, 'The argument provides direct evidence or examples to demonstrate that a phenomenon or fact does exist.', 'english'),
  ('statement_type', 'description', 1, 'These statements describe how things are. They can be true or false, but they are not about what should be — only what is (or was, or will be).', 'english'),
  ('argument_type', 'description', 2, 'The argument draws a parallel between two or more situations, cases, or examples. It claims that because two things are alike in some ways, they must be alike in another specific way.', 'english'),
  ('argument_type', 'description', 6, 'The argument proceeds from general premises to a specific conclusion. It typically starts with a rule or principle and applies it to a particular case.', 'english'),
  ('argument_type', 'description', 11, 'The argument moves from a set of specific observations to a broader generalization. It suggests that what is true in particular cases is likely true in general.', 'english'),
  ('argument_type', 'description', 13, 'The argument claims a cause-effect relationship between two things. It often posits that one event leads (or led) to another.', 'english'),
  ('argument_type', 'description', 15, 'The argument attempts to show that a statement leads to a contradiction or an absurd result. Therefore, it concludes that the original statement must be false or untenable.', 'english'),
  ('argument_type', 'description', 5, 'The argument expresses doubt about what we can know, how we know it, or whether beliefs are justified. It casts uncertainty on a claim by questioning the evidence or our ability to know the truth.', 'english'),
  ('argument_type', 'description', 7, 'The argument claims that if something can''t be achieved on a smaller scale, it won''t succeed on a larger one. It assumes complex situations are merely scaled-up versions of simpler ones.', 'english'),
  ('argument_type', 'description', 10, 'The argument focuses on the consequences of accepting or rejecting a claim. It often asserts that a claim should be adopted for its benefits or avoided for its harms.', 'english'),
  ('argument_type', 'description', 16, 'The argument attacks a prescriptive statement by claiming it’s impossible or infeasible to follow. It concludes that since the action can’t be done, it shouldn’t be prescribed or expected.', 'english'),
  ('argument_type', 'description', 14, 'The argument makes a value judgment or recommendation (e.g., claims about what should or ought to be done). It typically concerns ethics, policy, or other prescriptive domains.', 'english'),
  ('statement_type', 'description', 3, 'Statements about what someone should or should not do.', 'english'),
  ('argument_type', 'description', 1, 'The argument cites an expert, a respected figure, or an authoritative source. It uses the authority’s statement or position to support its conclusion.', 'english'),
  ('argument_type', 'description', 4, 'The argument proposes the most plausible explanation among competing hypotheses. It typically begins with an observation or set of facts, then infers which explanation is most likely true.', 'english'),
  ('argument_type', 'description', 9, 'The argument relies on a statement that is treated as too obvious or self-evident to challenge. The premise is often considered common sense or plainly undeniable.', 'english'),
  ('argument_type', 'description', 12, 'The argument hinges on the way a key term or concept is defined. It contends that because something meets (or does not meet) a certain definition, a conclusion follows.', 'english'),
  ('argument_type', 'description', 3, 'The argument does not clearly fit any of the other categories. The line of reasoning may be unusual, mixed, or not yet covered by existing definitions.', 'english'),
  ('argument_type', 'description', 17, 'A statistical syllogism is a type of inductive argument that moves from a statistical generalization about a group to a conclusion about an individual member of that group. It has the structure: "Most A''s are B''s, X is an A, therefore X is likely a B".', 'english'),
  ('person', 'name', 5, 'admin', 'english');

INSERT INTO person (id, auth_role_id, language) VALUES
  (5, 1, 'english');

INSERT INTO personal_details (user_id, email, password_hash) VALUES
  (5, 'admin', '$2b$10$IRHmlV1u/pOf6mxL4xhG1.OO2umkVF3mbkkOgHZrvCcIRKjxaiBiu');

COMMIT;