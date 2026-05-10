-- Complete a focus session atomically: mark session complete and update garden tile in one transaction
CREATE OR REPLACE FUNCTION complete_focus_session(p_session_id uuid, p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_today date;
  v_session_count int;
  v_next_stage int;
BEGIN
  v_today := CURRENT_DATE;
  
  -- Update sessions row to mark as completed
  UPDATE sessions
  SET completed = true
  WHERE id = p_session_id
    AND user_id = p_user_id;
  
  -- Count completed sessions for today for this user
  SELECT COUNT(*)
  INTO v_session_count
  FROM sessions
  WHERE user_id = p_user_id
    AND completed = true
    AND DATE(start_time) = v_today;
  
  -- Determine next plant stage based on session count
  -- 1 session = stage 1, 2 sessions = stage 2, 3+ sessions = stage 3
  v_next_stage := LEAST(v_session_count, 3);
  
  -- Upsert garden_tiles row
  INSERT INTO garden_tiles (user_id, date, plant_stage, plant_type)
  VALUES (p_user_id, v_today, v_next_stage, 'flower')
  ON CONFLICT (user_id, date) DO UPDATE
  SET plant_stage = v_next_stage;
END;
$$ LANGUAGE plpgsql;

-- Complete a marathon session atomically: mark session complete and update garden tile in one transaction
CREATE OR REPLACE FUNCTION complete_marathon_session(p_session_id uuid, p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_today date;
  v_session_count int;
  v_next_stage int;
BEGIN
  v_today := CURRENT_DATE;
  
  -- Update sessions row to mark as completed
  UPDATE sessions
  SET completed = true
  WHERE id = p_session_id
    AND user_id = p_user_id;
  
  -- Count completed sessions for today for this user
  SELECT COUNT(*)
  INTO v_session_count
  FROM sessions
  WHERE user_id = p_user_id
    AND completed = true
    AND DATE(start_time) = v_today;
  
  -- Determine next plant stage based on session count
  -- 1 session = stage 1, 2 sessions = stage 2, 3+ sessions = stage 3
  v_next_stage := LEAST(v_session_count, 3);
  
  -- Upsert garden_tiles row
  INSERT INTO garden_tiles (user_id, date, plant_stage, plant_type)
  VALUES (p_user_id, v_today, v_next_stage, 'flower')
  ON CONFLICT (user_id, date) DO UPDATE
  SET plant_stage = v_next_stage;
END;
$$ LANGUAGE plpgsql;
