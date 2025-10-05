# Database Data Dictionary Tool

A comprehensive web-based tool for generating interactive table relationship diagrams and data dictionaries from database schemas. This tool helps database administrators, developers, and analysts visualize and document their database structures.

## 🚀 Features

- **Multiple Input Formats**: Support for JSON, XML, and SQL DDL formats
- **Interactive Diagrams**: Drag-and-drop relationship diagrams with multiple layout options
- **Comprehensive Dictionary**: Detailed table and column documentation
- **Export Options**: HTML, PDF, PNG, and JSON export capabilities
- **Responsive Design**: Works on desktop and mobile devices
- **Search & Filter**: Quick search and filtering of tables and columns

## 📋 Quick Start

1. Open `index.html` in your web browser
2. Navigate to the "Input Schema" tab
3. Either upload a schema file or paste your schema definition
4. Click "Parse Schema" to process your data
5. Explore the generated diagrams and dictionary in other tabs
6. Export your results in your preferred format

## 📊 Generating Schema from Your Database

### MySQL

```sql
-- Export table structure
SELECT 
    TABLE_NAME as table_name,
    COLUMN_NAME as column_name,
    DATA_TYPE as data_type,
    IS_NULLABLE as is_nullable,
    COLUMN_KEY as column_key,
    COLUMN_DEFAULT as column_default,
    EXTRA as extra,
    COLUMN_COMMENT as description
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'your_database_name'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Export foreign key relationships
SELECT 
    TABLE_NAME as from_table,
    COLUMN_NAME as from_column,
    REFERENCED_TABLE_NAME as to_table,
    REFERENCED_COLUMN_NAME as to_column,
    'foreign_key' as type
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'your_database_name'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### PostgreSQL

```sql
-- Export table structure
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRI'
        WHEN fk.column_name IS NOT NULL THEN 'MUL'
        WHEN uk.column_name IS NOT NULL THEN 'UNI'
        ELSE ''
    END as column_key,
    col_description(pgc.oid, c.ordinal_position) as description
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_class pgc ON pgc.relname = t.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON pk.table_name = t.table_name AND pk.column_name = c.column_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON fk.table_name = t.table_name AND fk.column_name = c.column_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'UNIQUE'
) uk ON uk.table_name = t.table_name AND uk.column_name = c.column_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- Export foreign key relationships
SELECT 
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column,
    'foreign_key' as type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';
```

### SQL Server

```sql
-- Export table structure
SELECT 
    t.TABLE_NAME as table_name,
    c.COLUMN_NAME as column_name,
    c.DATA_TYPE as data_type,
    c.IS_NULLABLE as is_nullable,
    c.COLUMN_DEFAULT as column_default,
    CASE 
        WHEN pk.COLUMN_NAME IS NOT NULL THEN 'PRI'
        WHEN fk.COLUMN_NAME IS NOT NULL THEN 'MUL'
        WHEN uk.COLUMN_NAME IS NOT NULL THEN 'UNI'
        ELSE ''
    END as column_key,
    ISNULL(ep.value, '') as description
FROM INFORMATION_SCHEMA.TABLES t
JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
LEFT JOIN (
    SELECT ku.TABLE_NAME, ku.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
    WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
) pk ON pk.TABLE_NAME = t.TABLE_NAME AND pk.COLUMN_NAME = c.COLUMN_NAME
LEFT JOIN (
    SELECT ku.TABLE_NAME, ku.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
    WHERE tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
) fk ON fk.TABLE_NAME = t.TABLE_NAME AND fk.COLUMN_NAME = c.COLUMN_NAME
LEFT JOIN (
    SELECT ku.TABLE_NAME, ku.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
    WHERE tc.CONSTRAINT_TYPE = 'UNIQUE'
) uk ON uk.TABLE_NAME = t.TABLE_NAME AND uk.COLUMN_NAME = c.COLUMN_NAME
LEFT JOIN sys.extended_properties ep ON ep.major_id = OBJECT_ID(t.TABLE_SCHEMA + '.' + t.TABLE_NAME)
    AND ep.minor_id = c.ORDINAL_POSITION AND ep.name = 'MS_Description'
WHERE t.TABLE_SCHEMA = 'dbo'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;

-- Export foreign key relationships
SELECT 
    OBJECT_NAME(fk.parent_object_id) as from_table,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) as from_column,
    OBJECT_NAME(fk.referenced_object_id) as to_table,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) as to_column,
    'foreign_key' as type
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id;
```

## 📝 Schema Format Examples

### JSON Format

```json
{
  "database": "sample_db",
  "description": "Sample database description",
  "tables": [
    {
      "name": "users",
      "type": "table",
      "description": "User accounts",
      "columns": [
        {
          "name": "id",
          "type": "INT",
          "nullable": false,
          "primary_key": true,
          "auto_increment": true,
          "description": "Unique user identifier"
        },
        {
          "name": "email",
          "type": "VARCHAR(255)",
          "nullable": false,
          "unique": true,
          "description": "User email address"
        },
        {
          "name": "created_at",
          "type": "TIMESTAMP",
          "nullable": false,
          "default": "CURRENT_TIMESTAMP",
          "description": "Account creation timestamp"
        }
      ]
    },
    {
      "name": "orders",
      "type": "table",
      "description": "Customer orders",
      "columns": [
        {
          "name": "id",
          "type": "INT",
          "nullable": false,
          "primary_key": true,
          "auto_increment": true,
          "description": "Unique order identifier"
        },
        {
          "name": "user_id",
          "type": "INT",
          "nullable": false,
          "foreign_key": true,
          "description": "Reference to user"
        },
        {
          "name": "total",
          "type": "DECIMAL(10,2)",
          "nullable": false,
          "description": "Order total amount"
        }
      ]
    }
  ],
  "relationships": [
    {
      "from_table": "orders",
      "from_column": "user_id",
      "to_table": "users",
      "to_column": "id",
      "type": "foreign_key",
      "description": "Order belongs to user"
    }
  ]
}
```

### XML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<database name="sample_db" description="Sample database description">
  <tables>
    <table name="users" type="table" description="User accounts">
      <columns>
        <column name="id" type="INT" nullable="false" primary_key="true" auto_increment="true" description="Unique user identifier" />
        <column name="email" type="VARCHAR(255)" nullable="false" unique="true" description="User email address" />
        <column name="created_at" type="TIMESTAMP" nullable="false" default="CURRENT_TIMESTAMP" description="Account creation timestamp" />
      </columns>
    </table>
    
    <table name="orders" type="table" description="Customer orders">
      <columns>
        <column name="id" type="INT" nullable="false" primary_key="true" auto_increment="true" description="Unique order identifier" />
        <column name="user_id" type="INT" nullable="false" foreign_key="true" description="Reference to user" />
        <column name="total" type="DECIMAL(10,2)" nullable="false" description="Order total amount" />
      </columns>
    </table>
  </tables>
  
  <relationships>
    <relationship from_table="orders" from_column="user_id" to_table="users" to_column="id" type="foreign_key" description="Order belongs to user" />
  </relationships>
</database>
```

## 🔧 Converting Database Export to Tool Format

### Python Script for MySQL

```python
import mysql.connector
import json

def export_mysql_schema(host, user, password, database):
    conn = mysql.connector.connect(
        host=host, user=user, password=password, database=database
    )
    cursor = conn.cursor(dictionary=True)
    
    # Get tables and columns
    cursor.execute("""
        SELECT 
            TABLE_NAME as table_name,
            COLUMN_NAME as column_name,
            DATA_TYPE as data_type,
            IS_NULLABLE as is_nullable,
            COLUMN_KEY as column_key,
            COLUMN_DEFAULT as column_default,
            EXTRA as extra,
            COLUMN_COMMENT as description
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = %s
        ORDER BY TABLE_NAME, ORDINAL_POSITION
    """, (database,))
    
    columns_data = cursor.fetchall()
    
    # Get relationships
    cursor.execute("""
        SELECT 
            TABLE_NAME as from_table,
            COLUMN_NAME as from_column,
            REFERENCED_TABLE_NAME as to_table,
            REFERENCED_COLUMN_NAME as to_column
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_SCHEMA = %s
        AND REFERENCED_TABLE_NAME IS NOT NULL
    """, (database,))
    
    relationships_data = cursor.fetchall()
    
    # Process data
    tables = {}
    for col in columns_data:
        table_name = col['table_name']
        if table_name not in tables:
            tables[table_name] = {
                'name': table_name,
                'type': 'table',
                'columns': []
            }
        
        column = {
            'name': col['column_name'],
            'type': col['data_type'].upper(),
            'nullable': col['is_nullable'] == 'YES',
            'primary_key': col['column_key'] == 'PRI',
            'foreign_key': col['column_key'] == 'MUL',
            'unique': col['column_key'] == 'UNI',
            'auto_increment': 'auto_increment' in col['extra'],
            'default': col['column_default'],
            'description': col['description'] or ''
        }
        tables[table_name]['columns'].append(column)
    
    relationships = []
    for rel in relationships_data:
        relationships.append({
            'from_table': rel['from_table'],
            'from_column': rel['from_column'],
            'to_table': rel['to_table'],
            'to_column': rel['to_column'],
            'type': 'foreign_key'
        })
    
    schema = {
        'database': database,
        'tables': list(tables.values()),
        'relationships': relationships
    }
    
    return json.dumps(schema, indent=2)

# Usage
schema_json = export_mysql_schema('localhost', 'user', 'password', 'your_database')
with open('schema.json', 'w') as f:
    f.write(schema_json)
```

### Node.js Script for PostgreSQL

```javascript
const { Client } = require('pg');
const fs = require('fs');

async function exportPostgreSQLSchema(config) {
    const client = new Client(config);
    await client.connect();
    
    // Get tables and columns
    const columnsQuery = `
        SELECT 
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default,
            CASE 
                WHEN pk.column_name IS NOT NULL THEN 'PRI'
                WHEN fk.column_name IS NOT NULL THEN 'MUL'
                WHEN uk.column_name IS NOT NULL THEN 'UNI'
                ELSE ''
            END as column_key
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN (
            SELECT ku.table_name, ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON pk.table_name = t.table_name AND pk.column_name = c.column_name
        LEFT JOIN (
            SELECT ku.table_name, ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
        ) fk ON fk.table_name = t.table_name AND fk.column_name = c.column_name
        LEFT JOIN (
            SELECT ku.table_name, ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'UNIQUE'
        ) uk ON uk.table_name = t.table_name AND uk.column_name = c.column_name
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name, c.ordinal_position
    `;
    
    const columnsResult = await client.query(columnsQuery);
    
    // Get relationships
    const relationshipsQuery = `
        SELECT 
            tc.table_name as from_table,
            kcu.column_name as from_column,
            ccu.table_name as to_table,
            ccu.column_name as to_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `;
    
    const relationshipsResult = await client.query(relationshipsQuery);
    
    // Process data
    const tables = {};
    columnsResult.rows.forEach(col => {
        if (!tables[col.table_name]) {
            tables[col.table_name] = {
                name: col.table_name,
                type: 'table',
                columns: []
            };
        }
        
        tables[col.table_name].columns.push({
            name: col.column_name,
            type: col.data_type.toUpperCase(),
            nullable: col.is_nullable === 'YES',
            primary_key: col.column_key === 'PRI',
            foreign_key: col.column_key === 'MUL',
            unique: col.column_key === 'UNI',
            default: col.column_default,
            description: ''
        });
    });
    
    const relationships = relationshipsResult.rows.map(rel => ({
        from_table: rel.from_table,
        from_column: rel.from_column,
        to_table: rel.to_table,
        to_column: rel.to_column,
        type: 'foreign_key'
    }));
    
    const schema = {
        database: config.database,
        tables: Object.values(tables),
        relationships: relationships
    };
    
    await client.end();
    return JSON.stringify(schema, null, 2);
}

// Usage
exportPostgreSQLSchema({
    host: 'localhost',
    port: 5432,
    database: 'your_database',
    user: 'your_user',
    password: 'your_password'
}).then(schema => {
    fs.writeFileSync('schema.json', schema);
    console.log('Schema exported successfully!');
});
```

## 🎨 Customization

### Adding Custom Layouts

You can extend the diagram layouts by modifying the `renderDiagram` function in `script.js`:

```javascript
// Add custom layout option
if (layoutType === 'custom') {
    // Your custom layout logic here
    nodes.forEach((node, i) => {
        // Position nodes according to your algorithm
        node.x = customXPosition;
        node.y = customYPosition;
    });
}
```

### Styling Customization

Modify `styles.css` to customize the appearance:

```css
/* Custom table colors */
.node rect {
    fill: #your-color;
    stroke: #your-border-color;
}

/* Custom relationship lines */
.link {
    stroke: #your-line-color;
    stroke-width: your-width;
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Schema not parsing**: Check JSON/XML syntax
2. **Diagram not showing**: Ensure relationships are properly defined
3. **Export not working**: Check browser console for errors
4. **Large schemas slow**: Consider breaking into smaller chunks

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For support and questions, please open an issue in the project repository.

---

**Happy Database Documentation! 📊**


## Online Access
The transformed website is accessible at `https://logicthread.github.io/class_activity_bio/Q5/`
