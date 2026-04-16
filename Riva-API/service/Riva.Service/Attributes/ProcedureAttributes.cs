using System;

namespace Riva.Service.Attributes;

/// <summary>
/// Marks a class as a database procedure command
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
public class ProcedureNameAttribute : Attribute
{
    public string ProcedureName { get; }

    public ProcedureNameAttribute(string procedureName)
    {
        ProcedureName = procedureName;
    }
}

/// <summary>
/// Marks a property as a stored procedure parameter
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class ProcedureParameterAttribute : Attribute
{
    public string ParameterName { get; }
    public System.Data.ParameterDirection Direction { get; set; } = System.Data.ParameterDirection.Input;

    public ProcedureParameterAttribute(string parameterName)
    {
        ParameterName = parameterName;
    }
}

/// <summary>
/// Marks a class as a procedure result entity
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
public class ProcedureResultAttribute : Attribute
{
}
