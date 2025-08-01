# Set your existing policy ARN
$policyArn = "arn:aws:iam::348286729043:policy/SavingsPlanDenyPolicy"

# Fetch all IAM roles
$roles = aws iam list-roles | ConvertFrom-Json

# Loop through and attach the policy to each role
foreach ($role in $roles.Roles) {
    $roleName = $role.RoleName
    Write-Host "➡️  Attaching policy to role: $roleName"
    
    try {
        aws iam attach-role-policy --role-name $roleName --policy-arn $policyArn
        Write-Host "✅ Successfully attached to $roleName"
    } catch {
        Write-Host "❌ Failed to attach policy to ${roleName}: $_"
    }
}
