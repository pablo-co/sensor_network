CREATE OR REPLACE FUNCTION inspections_insert() RETURNS TRIGGER AS
$BODY$
DECLARE
  l record;
BEGIN
  FOR l IN
    SELECT * FROM prerequisites WHERE parent_code = NEW.inspection_type_code
  LOOP
    IF (SELECT count(*) FROM inspections WHERE location = NEW.location and license = NEW.license AND inspection_type_code = l.child_code AND score >= 75) = 0 THEN
      RAISE EXCEPTION 'There is a prerequisite which has not been passed';
    END IF;
  END LOOP;

  IF (SELECT COUNT(*) FROM inspections WHERE inspection_type_code = New.inspection_type_code AND location = NEW.location AND license = NEW.license AND score >= 75) > 0 THEN
    RAISE EXCEPTION 'Inspection already passed';
  END IF;

  IF (NEW.score < 0 OR NEW.score > 100) THEN
    RAISE EXCEPTION 'Not a valid score';
  END IF;

  IF (SELECT count(*) FROM inspections WHERE inspector_id = NEW.inspector_id AND date > current_date - interval '1' month) > 4 THEN
    RAISE EXCEPTION 'Inspector has passed the maximum amount of inspections he can make in the last 30 days';
  END IF;
  RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER inspections_insert BEFORE INSERT ON inspections
FOR EACH ROW EXECUTE PROCEDURE inspections_insert();


