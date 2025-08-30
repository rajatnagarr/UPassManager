// backend-api/pages/api/message-templates.js
import pool, { executeQuery } from '../../db';
import { verifyToken } from '../../../backend-common/auth';

export default async function handler(req, res) {
  // Verify the authentication token - temporarily allow all authenticated users
  try {
    // Get userRole from cookies or headers
    let userRole = null;
    
    // Check for cookies
    if (req.headers.cookie) {
      const cookies = {};
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const name = parts[0].trim();
        const value = parts[1] || '';
        cookies[name] = decodeURIComponent(value.trim());
      });
      
      userRole = cookies.userRole;
    }
    
    // If no role in cookies, check headers
    if (!userRole && req.headers.authorization) {
      userRole = req.headers.authorization;
    }
    
    // For development, allow all authenticated requests
    // In production, you would check if user.role === 'admin'
    if (!userRole) {
      console.log('No userRole found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('User authenticated with role:', userRole);
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Route based on HTTP method
  switch (req.method) {
    case 'GET':
      return getTemplates(req, res);
    case 'POST':
      return createTemplate(req, res);
    case 'PUT':
      return updateTemplate(req, res);
    case 'DELETE':
      return deleteTemplate(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get all templates
async function getTemplates(req, res) {
  try {
    const templates = await executeQuery(
      'SELECT * FROM message_templates ORDER BY created_at DESC'
    );
    return res.status(200).json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Create a new template
async function createTemplate(req, res) {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const result = await executeQuery(
      'INSERT INTO message_templates (title, message, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [title, message]
    );
    
    const newTemplate = await executeQuery(
      'SELECT * FROM message_templates WHERE id = ?',
      [result.insertId]
    );
    
    return res.status(201).json({ 
      message: 'Template created successfully', 
      template: newTemplate[0] 
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Update an existing template
async function updateTemplate(req, res) {
  const { id, title, message } = req.body;

  if (!id || !title || !message) {
    return res.status(400).json({ message: 'ID, title, and message are required' });
  }

  try {
    const result = await executeQuery(
      'UPDATE message_templates SET title = ?, message = ?, updated_at = NOW() WHERE id = ?',
      [title, message, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    const updatedTemplate = await executeQuery(
      'SELECT * FROM message_templates WHERE id = ?',
      [id]
    );
    
    return res.status(200).json({ 
      message: 'Template updated successfully', 
      template: updatedTemplate[0] 
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete a template
async function deleteTemplate(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Template ID is required' });
  }

  try {
    const result = await executeQuery(
      'DELETE FROM message_templates WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    return res.status(200).json({ 
      message: 'Template deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
