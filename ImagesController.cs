using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly string _baseUploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        public ImagesController()
        {
            // Создаем базовую директорию для загрузок если её нет
            if (!Directory.Exists(_baseUploadPath))
            {
                Directory.CreateDirectory(_baseUploadPath);
            }
        }

        [HttpGet("Category/{categoryName}/{productId}/{imageIndex}.{extension}")]
        public IActionResult GetCategoryProductImage(string categoryName, int productId, int imageIndex, string extension)
        {
            try
            {
                // Формируем путь к файлу
                var categoryPath = Path.Combine(_baseUploadPath, "Category", categoryName);
                var fileName = $"{productId}_{imageIndex}.{extension}";
                var filePath = Path.Combine(categoryPath, fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Файл не найден: {filePath}");
                }

                var contentType = GetContentType(extension);
                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Ошибка получения изображения: {ex.Message}" });
            }
        }

        [HttpPost("Category/{categoryName}/{productId}/{imageIndex}")]
        public async Task<IActionResult> UploadCategoryProductImage(string categoryName, int productId, int imageIndex, [FromForm] IFormFile image)
        {
            try
            {
                if (image == null || image.Length == 0)
                {
                    return BadRequest("Файл изображения не выбран");
                }

                // Проверяем тип файла
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(image.ContentType.ToLower()))
                {
                    return BadRequest("Неподдерживаемый тип файла. Разрешены только JPEG, PNG и GIF");
                }

                // Проверяем размер файла (максимум 5MB)
                if (image.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("Размер файла превышает 5MB");
                }

                // Создаем директорию для категории если её нет
                var categoryPath = Path.Combine(_baseUploadPath, "Category", categoryName);
                if (!Directory.Exists(categoryPath))
                {
                    Directory.CreateDirectory(categoryPath);
                }

                // Получаем расширение файла
                var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension))
                {
                    extension = "jpg"; // По умолчанию jpg
                }

                // Создаем имя файла
                var fileName = $"{productId}_{imageIndex}{extension}";
                var filePath = Path.Combine(categoryPath, fileName);

                // Сохраняем файл
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Возвращаем информацию о загруженном файле
                var response = new
                {
                    success = true,
                    message = "Изображение успешно загружено",
                    fileName = fileName,
                    filePath = $"/api/Images/Category/{categoryName}/{productId}/{imageIndex}{extension}",
                    productId = productId,
                    categoryName = categoryName,
                    imageIndex = imageIndex,
                    fileSize = image.Length,
                    contentType = image.ContentType
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Ошибка загрузки изображения: {ex.Message}" });
            }
        }

        private string GetContentType(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }
} 