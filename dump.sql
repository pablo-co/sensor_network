CREATE TABLE inspection_types (
  code CHAR(3) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  cost INT NOT NULL);

CREATE TABLE prerequisites (
  parent_code CHAR(3) NOT NULL,
  child_code CHAR(3) NOT NULL,
  PRIMARY KEY (parent_code, child_code),
  FOREIGN KEY (parent_code)
  REFERENCES inspection_types(code)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (child_code)
  REFERENCES inspection_types(code)
  ON DELETE CASCADE
  ON UPDATE CASCADE);

CREATE TABLE inspectors (
  id INT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  hire_date DATE NOT NULL);

CREATE TABLE builders (
  license INT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  address VARCHAR(45) NOT NULL);

CREATE TABLE buildings (
  location VARCHAR(100) NOT NULL,
  license INT NOT NULL,
  type VARCHAR(11) NOT NULL,
  size INT NOT NULL,
  first_activity DATE NULL,
  PRIMARY KEY (license, location),
  FOREIGN KEY (license)
  REFERENCES builders (license)
  ON DELETE CASCADE
  ON UPDATE RESTRICT);

CREATE TABLE inspections (
  date DATE NOT NULL,
  license INT NOT NULL,
  location VARCHAR(100) NOT NULL,
  score SMALLINT NOT NULL,
  inspection_type_code CHAR(3) NOT NULL,
  notes VARCHAR(1000) NULL,
  inspector_id INT NOT NULL,
  PRIMARY KEY (date, license, location),
  FOREIGN KEY (license, location)
  REFERENCES buildings (license, location)
  ON DELETE CASCADE
  ON UPDATE RESTRICT,
  FOREIGN KEY (inspector_id)
  REFERENCES inspectors(id)
  ON DELETE RESTRICT
  ON UPDATE RESTRICT,
  FOREIGN KEY (inspection_type_code)
  REFERENCES inspection_types(code)
  ON DELETE RESTRICT
  ON UPDATE CASCADE);

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

CREATE OR REPLACE FUNCTION inspections_update() RETURNS TRIGGER AS
$BODY$
BEGIN
   IF (OLD.date <> NEW.date OR OLD.location <> NEW.location OR OLD.license <>
    NEW.license OR OLD.score <> NEW.score OR OLD.inspection_type_code <>
    NEW.inspection_type_code OR OLD.inspector_id <> NEW.inspector_id) THEN
    RAISE EXCEPTION 'You can only update the inspection info.';
  END IF;
  RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER inspections_update BEFORE UPDATE ON buildings
FOR EACH ROW EXECUTE PROCEDURE inspections_update();

CREATE OR REPLACE FUNCTION buildings_insert() RETURNS TRIGGER AS
$BODY$
BEGIN
   IF (NEW.type NOT IN ('residential','commercial')) THEN
    RAISE EXCEPTION 'Not a valid building type';
  END IF;
  RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER buildings_insert BEFORE INSERT ON buildings
FOR EACH ROW EXECUTE PROCEDURE buildings_insert();

CREATE OR REPLACE FUNCTION buildings_update() RETURNS TRIGGER AS
$BODY$
BEGIN
  IF (NEW.location <> OLD.location) THEN
    RAISE EXCEPTION 'The building location cannot be changed';
  END IF;
  RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER buildings_update BEFORE UPDATE ON inspections
FOR EACH ROW EXECUTE PROCEDURE buildings_update();

INSERT INTO inspection_types VALUES ('FRM', 'Framing', 100);
INSERT INTO inspection_types VALUES ('PLU', 'Plumbing', 100);
INSERT INTO inspection_types VALUES ('POL', 'Pool', 50);
INSERT INTO inspection_types VALUES ('ELE', 'Electrical', 100);
INSERT INTO inspection_types VALUES ('SAF', 'Safety', 50);
INSERT INTO inspection_types VALUES ('HAC', 'Heating/Cooling', 100);
INSERT INTO inspection_types VALUES ('FNL', 'Final', 200);
INSERT INTO inspection_types VALUES ('FN2', 'Final - 2 needed', 150);
INSERT INTO inspection_types VALUES ('FN3', 'Final - plumbing', 150);

INSERT INTO prerequisites VALUES ('PLU', 'FRM');
INSERT INTO prerequisites VALUES ('POL', 'PLU');
INSERT INTO prerequisites VALUES ('ELE', 'FRM');
INSERT INTO prerequisites VALUES ('HAC', 'ELE');
INSERT INTO prerequisites VALUES ('FNL', 'HAC');
INSERT INTO prerequisites VALUES ('FNL', 'PLU');
INSERT INTO prerequisites VALUES ('FN2', 'ELE');
INSERT INTO prerequisites VALUES ('FN2', 'PLU');
INSERT INTO prerequisites VALUES ('FN3', 'PLU');

INSERT INTO inspectors VALUES (101, 'Robert Coste', '1984-08-11');
INSERT INTO inspectors VALUES (102, 'John Ronny', '1994-08-11');
INSERT INTO inspectors VALUES (103, 'Paul Lanister', '2004-08-11');
INSERT INTO inspectors VALUES (104, 'Jan Maner', '2008-01-11');
INSERT INTO inspectors VALUES (105, 'Juan Ramirez', '2016-01-11');

INSERT INTO builders VALUES (12345, 'Best Builders', '1 Infinite Loop, CA, 1234');
INSERT INTO builders VALUES (23456, 'Worst Builders', '89 Robinson St, Dallas, TX');
INSERT INTO builders VALUES (34567, 'The Builders', '90 Arrinson Road, San Antonnio, TX');
INSERT INTO builders VALUES (45678, 'Not builders', '82 Tree Avenue, San Fransisco, TX');
INSERT INTO builders VALUES (12321, 'HP Construction', '45 Tablet Road, San Diego, CA');

INSERT INTO buildings VALUES ('100 Main St., Dallas, TX', 12345, 'commercial', 250000, '12/31/1999');
INSERT INTO buildings VALUES ('300 Oak St., Dallas, TX', 12345, 'residential', 3000, '1/1/2000');
INSERT INTO buildings VALUES ('302 Oak St., Dallas, TX', 12345, 'residential', 4000, '2/1/2001');
INSERT INTO buildings VALUES ('304 Oak St., Dallas, TX', 12345, 'residential', 1500, '3/1/2002');
INSERT INTO buildings VALUES ('306 Oak St., Dallas, TX', 12345, 'residential', 1500, '4/1/2003');
INSERT INTO buildings VALUES ('308 Oak St., Dallas, TX', 12345, 'residential', 2000, '4/1/2003');

INSERT INTO buildings VALUES ('100 Industrial Ave., Fort Worth, TX', 23456, 'commercial', 100000, '6/1/2005');
INSERT INTO buildings VALUES ('101 Industrial Ave., Fort Worth, TX', 23456, 'commercial', 80000, '6/1/2005');
INSERT INTO buildings VALUES ('102 Industrial Ave., Fort Worth, TX', 23456, 'commercial', 75000, '6/1/2005');
INSERT INTO buildings VALUES ('103 Industrial Ave., Fort Worth, TX', 23456, 'commercial', 50000, '6/1/2005');
INSERT INTO buildings VALUES ('104 Industrial Ave., Fort Worth, TX', 23456, 'commercial', 80000, '6/1/2005');
INSERT INTO buildings VALUES ('105 Industrial Ave., Fort Worth, TX', 23456, 'commercial', 90000, '6/1/2005');

INSERT INTO buildings VALUES ('100 Winding Wood, Carrollton, TX', 45678, 'residential', 2500);
INSERT INTO buildings VALUES ('102 Winding Wood, Carrollton, TX', 45678, 'residential', 2800);

INSERT INTO buildings VALUES ('210 Cherry Bark Lane, Plano, TX', 12321, 'residential', 3200, '10/1/2016');
INSERT INTO buildings VALUES ('212 Cherry Bark Lane, Plano, TX', 12321, 'residential', 3100);
INSERT INTO buildings VALUES ('214 Cherry Bark Lane, Plano, TX', 12321, 'residential', 3200);
INSERT INTO buildings VALUES ('216 Cherry Bark Lane, Plano, TX', 12321, 'residential', 3300);

INSERT INTO inspections VALUES ('2016-11-06', 23456, '100 Industrial Ave., Fort Worth, TX', 100, 'FRM', 'okay', 105);
INSERT INTO inspections VALUES ('2016-11-08', 23456, '100 Industrial Ave., Fort Worth, TX', 100, 'PLU', 'no leaks', 102);
INSERT INTO inspections VALUES ('2016-11-12', 23456, '100 Industrial Ave., Fort Worth, TX', 80, 'POL', 'pool equipment okay', 102);
INSERT INTO inspections VALUES ('2016-11-14', 23456, '100 Industrial Ave., Fort Worth, TX', 100, 'FN3', 'no problems noted', 102);
INSERT INTO inspections VALUES ('2016-10-01', 45678, '100 Winding Wood, Carrollton, TX', 100, 'FRM', 'no problems noted', 103);
INSERT INTO inspections VALUES ('2016-10-02', 45678, '100 Winding Wood, Carrollton, TX', 100, 'PLU', 'everything working', 103);

INSERT INTO inspections VALUES ('2016-10-03', 45678, '100 Winding Wood, Carrollton, TX', 100, 'ELE', 'no problems noted', 103);
INSERT INTO inspections VALUES ('2016-11-02', 45678, '100 Winding Wood, Carrollton, TX', 100, 'HAC', 'no problems noted', 103);
INSERT INTO inspections VALUES ('2016-11-14', 45678, '100 Winding Wood, Carrollton, TX', 90, 'FNL', 'ready for owner, minor cleanup needed', 103);
INSERT INTO inspections VALUES ('2016-11-01', 45678, '102 Winding Wood, Carrollton, TX', 100, 'FRM', 'no problems noted', 103);
INSERT INTO inspections VALUES ('2016-11-02', 45678, '102 Winding Wood, Carrollton, TX', 90, 'PLU', 'minor leak, corrected', 103);
INSERT INTO inspections VALUES ('2016-11-03', 45678, '102 Winding Wood, Carrollton, TX', 80, 'ELE', 'exposed junction box', 103);

INSERT INTO inspections VALUES ('2016-11-02', 23456, '105 Industrial Ave., Fort Worth, TX', 100, 'FRM', 'tbd', 105);
INSERT INTO inspections VALUES ('2016-10-01', 12345, '300 Oak St., Dallas, TX', 100, 'FRM', 'no problems noted', 101);
INSERT INTO inspections VALUES ('2016-10-02', 12345, '300 Oak St., Dallas, TX', 90, 'PLU', 'minor leak, corrected', 101);
INSERT INTO inspections VALUES ('2016-10-03', 12345, '300 Oak St., Dallas, TX', 80, 'ELE', 'exposed junction box', 101);
INSERT INTO inspections VALUES ('2016-10-04', 12345, '300 Oak St., Dallas, TX', 80, 'HAC', 'duct needs taping', 101);
INSERT INTO inspections VALUES ('2016-10-05', 12345, '300 Oak St., Dallas, TX', 90, 'FNL', 'ready for owner', 101);

INSERT INTO inspections VALUES ('2016-10-01', 12345, '302 Oak St., Dallas, TX', 100, 'FRM', 'no problems noted', 102);
INSERT INTO inspections VALUES ('2016-10-02', 12345, '302 Oak St., Dallas, TX', 25, 'PLU', 'massive leaks', 102);
INSERT INTO inspections VALUES ('2016-10-08', 12345, '302 Oak St., Dallas, TX', 50, 'PLU', 'still leaking', 102);

INSERT INTO inspections VALUES ('2016-10-01', 12321, '210 Cherry Bark Lane, Plano, TX', 85, 'FRM', 'no issues but messy', 103);
INSERT INTO inspections VALUES ('2016-10-14', 12321, '210 Cherry Bark Lane, Plano, TX', 100, 'SAF', 'no problems noted', 104);
INSERT INTO inspections VALUES ('2016-12-05', 12321, '210 Cherry Bark Lane, Plano, TX', 80, 'PLU', 'duct needs sealing', 103);
INSERT INTO inspections VALUES ('2016-12-06', 12321, '210 Cherry Bark Lane, Plano, TX', 90, 'POL', 'ready for owner', 105);
INSERT INTO inspections VALUES ('2016-10-12', 12345, '302 Oak St., Dallas, TX', 80, 'PLU', 'no leaks, but messy', 102);
INSERT INTO inspections VALUES ('2016-10-07', 12345, '302 Oak St., Dallas, TX', 100, 'ELE', 'no problems noted', 102);
INSERT INTO inspections VALUES ('2016-12-04', 12345, '302 Oak St., Dallas, TX', 80, 'HAC', 'duct needs taping', 102);
INSERT INTO inspections VALUES ('2016-12-05', 12345, '302 Oak St., Dallas, TX', 90, 'FNL', 'ready for owner', 102);

