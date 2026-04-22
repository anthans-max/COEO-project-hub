alter table coeo_program_decisions
  add column source_project text[] not null default '{}';

update coeo_program_decisions set source_project = array['Customer Portal','Salesforce Discovery']            where code = 'OI-001';
update coeo_program_decisions set source_project = array['Customer Portal']                                   where code = 'OI-002';
update coeo_program_decisions set source_project = array['Customer Portal']                                   where code = 'OI-004';
update coeo_program_decisions set source_project = array['Customer Portal','Operational State Consolidation'] where code = 'OI-005';
update coeo_program_decisions set source_project = array['Customer Portal']                                   where code = 'OI-006';
update coeo_program_decisions set source_project = array['Customer Portal']                                   where code = 'OI-007';
update coeo_program_decisions set source_project = array['Customer Portal']                                   where code = 'OI-008';
update coeo_program_decisions set source_project = array['Customer Portal']                                   where code = 'OI-009';
update coeo_program_decisions set source_project = array['Salesforce Discovery']                              where code = 'OI-010';
update coeo_program_decisions set source_project = array['Enterprise Middleware']                             where code = 'OI-011';
update coeo_program_decisions set source_project = array['Customer Portal','Provisioning Portal']             where code = 'OI-012';
