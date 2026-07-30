import asyncHandler from 'express-async-handler';
import * as aiService from '../services/ai.service.js';

export const predictDemand = asyncHandler(async (req, res) => {
  const result = await aiService.predictDemand(req.body);
  res.status(200).json({ success: true, data: result });
});

export const predictBattery = asyncHandler(async (req, res) => {
  const result = await aiService.predictBatteryHealth(req.body);
  res.status(200).json({ success: true, data: result });
});

export const predictMaintenance = asyncHandler(async (req, res) => {
  const result = await aiService.predictMaintenance(req.body);
  res.status(200).json({ success: true, data: result });
});

export const recommendCharging = asyncHandler(async (req, res) => {
  const result = await aiService.recommendCharging(req.body);
  res.status(200).json({ success: true, data: result });
});
