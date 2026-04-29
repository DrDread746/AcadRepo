-- Update existing subjects with branch information
UPDATE subjects SET branch = 'CS' WHERE code IN ('CS201', 'CS202');
UPDATE subjects SET branch = 'ME' WHERE code = 'ME101';
UPDATE subjects SET branch = 'CS' WHERE code IN ('MA101', 'PH101', 'CH101');
