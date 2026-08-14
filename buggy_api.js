exports.searchUsers = async (req, res) => {
  const email = req.query.email.toLowerCase();
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 25);

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({ error: "page must be >= 1" });
  }

  const offset = (page - 1) * limit;
  const users = await db.query(
    "SELECT * FROM users WHERE email LIKE ? LIMIT ? OFFSET ?",
    [`%${email}%`, limit, offset]
  );

  return res.json({ users });
};
