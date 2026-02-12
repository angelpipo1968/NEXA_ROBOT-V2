class ExpressionManager:
    def __init__(self):
        self.current = "neutral"
    
    def set_expression(self, expression):
        print(f"😊 Avatar expression: {expression}")
        self.current = expression
