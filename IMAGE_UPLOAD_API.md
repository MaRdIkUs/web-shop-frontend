# API для загрузки изображений продуктов

## Обзор

Этот API позволяет загружать изображения для продуктов в админ панели.

## Endpoints

### 1. Загрузка изображения продукта

**POST** `/api/images/upload/category/{categoryId}/product/{productId}`

Загружает изображение для конкретного продукта.

#### Параметры пути
- `categoryId` (int) - ID категории продукта
- `productId` (int) - ID продукта

#### Параметры формы (multipart/form-data)
- `image` (file) - Файл изображения (JPEG, PNG, GIF)
- `categoryId` (int) - ID категории продукта
- `productId` (int) - ID продукта

#### Пример запроса
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('categoryId', categoryId);
formData.append('productId', productId);

const response = await fetch('/api/images/upload/category/1/product/123', {
  method: 'POST',
  body: formData
});
```

#### Успешный ответ (200 OK)
```json
{
  "success": true,
  "message": "Изображение успешно загружено",
  "fileName": "123_20250616151234.jpg",
  "filePath": "/uploads/products/123_20250616151234.jpg",
  "productId": 123,
  "categoryId": 1,
  "fileSize": 245760,
  "contentType": "image/jpeg"
}
```

#### Ошибки
- **400 Bad Request** - Файл не выбран или неподдерживаемый тип
- **413 Payload Too Large** - Размер файла превышает 5MB
- **500 Internal Server Error** - Ошибка сервера

### 2. Получение изображения продукта

**GET** `/api/productimage/uploads/products/{fileName}`

Получает изображение по имени файла.

#### Параметры пути
- `fileName` (string) - Имя файла изображения

#### Пример запроса
```javascript
const response = await fetch('/api/productimage/uploads/products/123_20250616151234.jpg');
const imageBlob = await response.blob();
```

#### Успешный ответ (200 OK)
- Возвращает файл изображения с соответствующим Content-Type

#### Ошибки
- **404 Not Found** - Файл не найден
- **500 Internal Server Error** - Ошибка сервера

## Ограничения

### Поддерживаемые форматы
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

### Размер файла
- Максимум: 5MB

### Именование файлов
Файлы автоматически переименовываются в формат:
`{productId}_{timestamp}_{extension}`

Пример: `123_20250616151234.jpg`

## Интеграция с фронтендом

### В React компоненте

```javascript
import adminService from '../services/adminService';

const handleImageUpload = async (productId, categoryId, imageFile) => {
  try {
    const response = await adminService.uploadProductImage(
      categoryId, 
      productId, 
      imageFile
    );
    
    console.log('Изображение загружено:', response.data);
    return response.data.filePath;
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    throw error;
  }
};
```

### В форме создания продукта

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Создаем продукт
    const productResponse = await apiCall(adminService.createProduct, productData);
    
    // Загружаем изображение если выбрано
    if (selectedImage && productResponse?.data?.id) {
      await apiCall(
        adminService.uploadProductImage, 
        formData.categoryId, 
        productResponse.data.id, 
        selectedImage
      );
    }
    
    // Обновляем список продуктов
    await loadProducts();
  } catch (error) {
    console.error('Ошибка:', error);
  }
};
```

## Настройка на бэкенде

### C# Контроллер

```csharp
[ApiController]
[Route("api/images")]
public class UploadController : ControllerBase
{
    private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "products");

    [HttpPost("upload/category/{categoryId}/product/{productId}")]
    public async Task<IActionResult> UploadProductImage(int categoryId, int productId, [FromForm] IFormFile image)
    {
        // Логика загрузки изображения
    }

    [HttpGet("uploads/products/{fileName}")]
    public IActionResult GetProductImage(string fileName)
    {
        // Логика получения изображения
    }
}
```

### Настройка статических файлов

В `Startup.cs` или `Program.cs`:

```csharp
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});
```

## Безопасность

1. **Валидация типов файлов** - Проверка MIME-типов
2. **Ограничение размера** - Максимум 5MB
3. **Уникальные имена** - Предотвращение перезаписи файлов
4. **Изоляция директорий** - Файлы сохраняются в отдельной папке

## Мониторинг

### Логирование
Все операции загрузки логируются с информацией:
- ID продукта
- Размер файла
- Тип файла
- Время загрузки
- Результат операции

### Обработка ошибок
- Детальные сообщения об ошибках
- Graceful degradation при сбоях
- Автоматическое создание директорий 