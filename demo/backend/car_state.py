from models import CarStateModel

class CarState:
    def __init__(self):
        self.state = CarStateModel()

    def get_state(self) -> CarStateModel:
        return self.state

car_state = CarState()
