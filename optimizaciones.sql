-- Agregar índices
ALTER TABLE usuarios ADD INDEX idx_email (email);
ALTER TABLE usuarios ADD INDEX idx_rut (rut);
ALTER TABLE clientes ADD INDEX idx_rut (rut);
ALTER TABLE vehiculos ADD INDEX idx_patente (patente);

-- Optimizar la tabla de reparaciones
ALTER TABLE reparaciones ADD INDEX idx_vehiculo_id (vehiculo_id);
ALTER TABLE reparaciones ADD INDEX idx_mecanico_id (mecanico_id);
ALTER TABLE reparaciones ADD INDEX idx_estado (estado);