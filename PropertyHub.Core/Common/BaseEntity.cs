using System.ComponentModel.DataAnnotations;

namespace PropertyHub.Core.Common;

public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
}

public abstract class AuditableEntity : BaseEntity
{
    public string? CreatedBy { get; set; }
    
    public string? UpdatedBy { get; set; }
}
