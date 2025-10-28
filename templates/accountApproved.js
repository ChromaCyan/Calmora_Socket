const accountApprovedEmail = (firstName) => `
  <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 40px 20px;">
    <div style="max-width: 600px; background: #fff; margin: 0 auto; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
      <div style="margin-bottom: 30px;">
        <img 
          src="https://xipqovlvavpygfnzjtpg.supabase.co/storage/v1/object/sign/profile-images/Calmora.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80YTAyMDlhYS00NjI2LTRhOTktYTM5Ny1jYzBmZDM2ZWJjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9maWxlLWltYWdlcy9DYWxtb3JhLnBuZyIsImlhdCI6MTc1NjkwNTIxNSwiZXhwIjoxNzg4NDQxMjE1fQ.fgcPnsPaGOlVUGU2DdGtMtYjOk40ZDGGM9RTotd_zUU"
          alt="Calmora Logo"
          style="width: 150px; display: block; margin: 0 auto;"
        />
      </div>
      <h2 style="color: #212529; font-size: 24px;">Account Approved</h2>
      <p style="font-size: 16px; color: #495057;">Hi <strong>${firstName}</strong>,</p>
      <p style="font-size: 16px; color: #495057;">
        Your Calmora specialist account has been approved! You can now log in and begin using the platform.
      </p>
      <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
        Thanks,<br>The Calmora Team
      </p>
    </div>
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #adb5bd;">
      Have questions? Contact us at <a href="mailto:support@calmora.com" style="color: #6c757d;">support@calmora.com</a>
    </div>
  </div>
`;

module.exports = accountApprovedEmail;
