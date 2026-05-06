namespace Riva.Dto.Category;

/// <summary>
/// DTO for category information
/// </summary>
public class CategoryDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int TemplateCount { get; set; }
}

/// <summary>
/// Request DTO for creating a new category (Admin only)
/// </summary>
public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating a category (Admin only)
/// </summary>
public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

/// <summary>
/// Response DTO for category creation
/// </summary>
public class CreateCategoryResponse
{
    public int CategoryId { get; set; }
    public string Message { get; set; } = string.Empty;
}
