// backend-api/pages/api/login.js
import { authenticateUser, generateToken } from '../../../backend-common/auth'; // Adjust the relative path as needed

export default async function handler(req, res) {

  //test comment

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const authResult = await authenticateUser(email, password);
  if (authResult.error) {
    return res.status(401).json({ message: authResult.error });
  }

//   // Generate JWT token upon successful authentication.
//   const token = generateToken(authResult.user);
  return res.status(200).json({
    message: 'Login successful',
    role: authResult.user.role,
    // token,  // Optional: if you need a token for session management.
  });
}
